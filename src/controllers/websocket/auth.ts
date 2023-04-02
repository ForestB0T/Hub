import type { database } from "../../structure/database/createPool";
import type { SocketStream } from "@fastify/websocket";
import InsertChatMessage from "../../structure/database/functions/INSERT/chatmessages.js";
import InsertChatAdvancement from "../../structure/database/functions/INSERT/advancement.js";
import InsertPlayerKill from "../../structure/database/functions/INSERT/saveKill.js";

import { DiscordMessage, FromDiscordLiveChatMessage, MessageHandler, MinecraftChatAdvancement, MinecraftChatMessage, MinecraftMessage, MinecraftPlayerDeath, MinecraftPlayerJoinArgs, MinecraftPlayerLeaveArgs, RemoveGuildArgs, RemoveLiveChatArgs, RouteItem } from "../../..";
import InsertPlayerJoin from "../../structure/database/functions/INSERT/savePlayerJoin.js";
import InsertPlayerLeave from "../../structure/database/functions/INSERT/savePlayerLeave.js";
import Logger from "../../structure/logger/Logger.js";

export const WebSocket_Client_Map: Map<string, SocketStream> = new Map();

const messageHandlers: MessageHandler[] = [
    {
        type: 'discord',
        handler: async (message: DiscordMessage, connection: SocketStream) => {
            switch (message.action) {
                case "chat":

                    const discordLiveChatArgs: FromDiscordLiveChatMessage = message.data;

                    const mcConn = WebSocket_Client_Map.get("minecraft" + message.data.mc_server);
                    if (!mcConn) return;

                    mcConn.socket.send(JSON.stringify({
                        action: "chat",
                        data: { username: discordLiveChatArgs.username, message: discordLiveChatArgs.message },
                    }))

                    break;
            }

        }
    },
    {
        type: 'minecraft',
        handler: async (message: MinecraftMessage, connection) => {
            const discConn = WebSocket_Client_Map.get("discord" + "main-bot");

            switch (message.action) {

                case "savechat":
                    const saveChatData = message.data as MinecraftChatMessage;

                    await InsertChatMessage({
                        name: saveChatData.name,
                        mc_server: saveChatData.mc_server,
                        message: saveChatData.message,
                        date: `${Date.now()}`
                    });

                    if (!discConn) return;
                    discConn.socket.send(JSON.stringify({ data: message.data, action: "sendchat", type: "chat" }))
                    return;

                case "savedeath":
                    const saveDeathData = message.data as MinecraftPlayerDeath;

                    await InsertPlayerKill({
                        victim: saveDeathData.victim,
                        death_message: saveDeathData.death_message,
                        murderer: saveDeathData.murderer ?? null,
                        time: saveDeathData.time,
                        mc_server: saveDeathData.mc_server,
                        type: saveDeathData.type
                    })

                    if (!discConn) return;
                    discConn.socket.send(JSON.stringify({ data: message.data, action: "sendchat", type: "death" }))
                    return;

                case "savejoin":
                    const saveJoinData = message.data as MinecraftPlayerJoinArgs;

                    await InsertPlayerJoin({
                        user: saveJoinData.user,
                        uuid: saveJoinData.uuid,
                        mc_server: saveJoinData.mc_server,
                        time: saveJoinData.time
                    })

                    if (!discConn) return;
                    discConn.socket.send(JSON.stringify({ data: message.data, action: "sendchat", type: "join" }))
                    return;

                case "saveleave":
                    const saveLeaveData = message.data as MinecraftPlayerLeaveArgs;

                    await InsertPlayerLeave({
                        mc_server: saveLeaveData.mc_server,
                        time: saveLeaveData.time,
                        username: saveLeaveData.username
                    })

                    if (!discConn) return;
                    discConn.socket.send(JSON.stringify({ data: message.data, action: "sendchat", type: "leave" }))
                    return;

                case "saveadvancement":
                    const saveadvancementData = message.data as MinecraftChatAdvancement

                    await InsertChatAdvancement({
                        username: saveadvancementData.username,
                        advancement: saveadvancementData.advancement,
                        mc_server: saveadvancementData.mc_server,
                        time: saveadvancementData.time
                    });

                    if (!discConn) return;
                    discConn.socket.send(JSON.stringify({ data: message.data, action: "sendchat", type: "advancement" }))
                    return;
            }
        }
    }
];

export default {
    method: "GET",
    url: "/authenticate",
    json: true,
    isPrivate: true,
    useWebsocket: true,
    handler: async (connection: SocketStream, rep, database: database) => {
        if (rep.headers["x-api-key"] !== process.env.APIKEY) {
            connection.socket.send(JSON.stringify({ success: false, reason: "Invalid key" }))
            return connection.socket.close();
        }

        const clientType: string = rep.headers["client-type"] as "discord" | "minecraft";

        let clientID: string = rep.headers["client-id"];
        const indendifier = clientType + clientID

        Logger.success(`Client: ${indendifier} connected.`, "WEBSOCKET");

        WebSocket_Client_Map.set(indendifier, connection);

        connection.socket.on("message", async message => {
            const payload = JSON.parse(message.toString());
            const handler = messageHandlers.find(handler => handler.type === clientType);

            if (!handler) {
                connection.socket.send(JSON.stringify({ success: false, reason: "Invalid payload type." }))
                return;
            };

            await handler.handler(payload, connection);
        })

        connection.socket.on('ping', (data) => {
            connection.socket.pong(data);
        });

        connection.socket.on("close", () => {
            Logger.warn(`Client: ${indendifier} has disconnected from the websocket.`, "WEBSOCKET")
            WebSocket_Client_Map.delete(indendifier);
        })

    }
} as RouteItem