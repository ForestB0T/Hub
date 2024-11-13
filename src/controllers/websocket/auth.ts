import type { database } from "../../structure/database/createPool";
import type { WebSocket } from "@fastify/websocket";
import InsertChatMessage from "../../structure/database/functions/INSERT/chatmessages.js";
import InsertChatAdvancement from "../../structure/database/functions/INSERT/advancement.js";
import InsertMinecraftDeath from "../../structure/database/functions/INSERT/saveKill.js";
import { DiscordMessage, FromDiscordLiveChatMessage, MessageHandler, MinecraftAdvancementMessage, MinecraftMessage, MinecraftPlayerDeath, MinecraftPlayerJoinArgs, MinecraftPlayerLeaveMessage, PlayerList, RemoveGuildArgs, RemoveLiveChatArgs, RouteItem } from "../../..";
import InsertPlayerJoin from "../../structure/database/functions/INSERT/savePlayerJoin.js";
import InsertPlayerLeave from "../../structure/database/functions/INSERT/savePlayerLeave.js";
import Logger from "../../structure/logger/Logger.js";
import api from "../../index.js";

import { inboundmessageDataTypes, messageActionTypes, MinecraftChatMessage} from "forestbot-api-wrapper-v2";

export const WebSocket_Client_Map: Map<string, WebSocket> = new Map();


/**
 * Broadcasts a message to all clients connected to the websocket.
 * @param data 
 * @param action 
 * @param clientmap 
 */
function broadcastToAllClients(data: inboundmessageDataTypes, action: messageActionTypes, clientmap: Map<string, WebSocket> = WebSocket_Client_Map) {
    clientmap.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify({
                action: action,
                data: data,
            }));
        }
    })
}


/**
 * Message handlers for the websocket.
 */
const messageHandlers: MessageHandler[] = [

    /**
     * Handling Discord websocket events
     */
    {
        type: 'discord',
        handler: async (message: DiscordMessage, connection: WebSocket) => {
            switch (message.action) {
                case "inbound_discord_chat":

                    const discordLiveChatArgs: FromDiscordLiveChatMessage = message.data;
                
                    const mcConn = WebSocket_Client_Map.get("minecraft" + message.data.mc_server);
                    if (!mcConn) return;

                    mcConn.send(JSON.stringify({
                        action: "inbound_discord_chat",
                        data: { 
                            username: discordLiveChatArgs.username, 
                            message: discordLiveChatArgs.message,
                            mc_server: discordLiveChatArgs.mc_server, 
                        },
                    }))

                    break;
            }

        }
    },

    /**
     * Handling minecraft websocket events.
     */
    {
        type: 'minecraft',
        handler: async (message: MinecraftMessage, connection) => {
            switch (message.action) {

                /**
                 * Saving minecraft chat messages.
                 */
                case "inbound_minecraft_chat":
                    const saveChatData = message.data as MinecraftChatMessage;

                    await InsertChatMessage({
                        name: saveChatData.name,
                        mc_server: saveChatData.mc_server,
                        message: saveChatData.message,
                        date: `${Date.now()}`,
                        uuid: saveChatData.uuid
                    });

                    broadcastToAllClients(message.data as MinecraftChatMessage, "inbound_minecraft_chat", WebSocket_Client_Map)
                    return;

                /**
                 * Saving minecraft death and kill?
                 */
                case "minecraft_player_death":
                    const saveDeathData = message.data as MinecraftPlayerDeath;

                    await InsertMinecraftDeath({
                        victim: saveDeathData.victim,
                        death_message: saveDeathData.death_message,
                        murderer: saveDeathData.murderer ?? null,
                        time: saveDeathData.time,
                        mc_server: saveDeathData.mc_server,
                        type: saveDeathData.type,
                        victimUUID: saveDeathData.victimUUID,
                        murdererUUID: saveDeathData.murdererUUID
                    })

                    broadcastToAllClients(saveDeathData, "minecraft_player_death", WebSocket_Client_Map)
                   return;

                /**
                 * Saving minecraft player join
                 */
                case "minecraft_player_join":
                    const saveJoinData = message.data as MinecraftPlayerJoinArgs;
                    try {
                        await InsertPlayerJoin({
                            username: saveJoinData.username,
                            uuid: saveJoinData.uuid,
                            server: saveJoinData.server,
                            timestamp: saveJoinData.timestamp
                        })
                    } catch (err) {
                        console.error(err, " Error in player join")
                    }
                    broadcastToAllClients(message.data as MinecraftPlayerJoinArgs, "minecraft_player_join", WebSocket_Client_Map)
                    return;

                /**
                 * Saving minecraft player leave
                 */
                case "minecraft_player_leave":
                    const saveLeaveData = message.data as MinecraftPlayerLeaveMessage;

                    await InsertPlayerLeave({
                        server: saveLeaveData.server,
                        timestamp: saveLeaveData.timestamp,
                        username: saveLeaveData.username,
                        uuid: saveLeaveData.uuid
                    })

                    broadcastToAllClients(message.data as MinecraftPlayerLeaveMessage, "minecraft_player_leave", WebSocket_Client_Map)
                    return;

                /**
                 * Saving minecraft player advancement
                 */
                case "minecraft_advancement":
                    const saveadvancementData = message.data as MinecraftAdvancementMessage

                    await InsertChatAdvancement({
                        username: saveadvancementData.username,
                        advancement: saveadvancementData.advancement,
                        mc_server: saveadvancementData.mc_server,
                        time: saveadvancementData.time,
                        uuid: saveadvancementData.uuid
                    });

                    broadcastToAllClients(message.data as MinecraftAdvancementMessage, "minecraft_advancement", WebSocket_Client_Map)
                    return;

                /**
                 * Recieving player lists from the minecraft server.
                 * This will be used to generate the tablist and to update the player list.
                 */
                case "send_update_player_list":
                    const playerListData = message.data["players"] as PlayerList[]
                    await api.updatePlayerList(playerListData[0].server, playerListData);
            }
        }
    }
];


/**
 * Route for connecting to the websocket.
 * This route is used by the clients to connect to the websocket.
 */
export default {
    method: "GET",
    url: "/websocket/connect",
    json: true,
    isPrivate: true,
    useWebsocket: true,
    handler: async (connection: WebSocket, rep, database: database) => {

        /**
         * Checking if the client has the correct API key.
         */
        if (rep.headers["x-api-key"] !== process.env.APIKEY) {
            connection.send(JSON.stringify({ success: false, reason: "Invalid key" }))
            return connection.close();
        }

        const clientType: string = rep.headers["client-type"] as "discord" | "minecraft" | "other";
        const mc_server: string = rep.headers['mc_server'] as string;
        const indendifier: string = clientType + mc_server

        Logger.success(`Client type: ${clientType} | Server: ${mc_server} just connected to the API via Websocket`, "WEBSOCKET");


        /**
         * Adding the client to the map.
         */
        WebSocket_Client_Map.set(indendifier, connection);

        /**
         * Handling messages from the client.
         */
        connection.on("message", async message => {
            const payload = JSON.parse(message.toString());
            const handler = messageHandlers.find(handler => handler.type === clientType);

            if (!handler) {
                connection.send(JSON.stringify({ success: false, reason: "Invalid payload type." }))
                return;
            };

            await handler.handler(payload, connection);
        })

        /**
         * Handling ping messages.
         */
        connection.on('ping', (data) => {
            connection.pong(data);
        });

        /**
         * Handling close messages.
         */
        connection.on("close", () => {
            Logger.warn(`Client: ${indendifier} has disconnected from the websocket.`, "WEBSOCKET")
            WebSocket_Client_Map.delete(indendifier);
        })

    }
} as RouteItem