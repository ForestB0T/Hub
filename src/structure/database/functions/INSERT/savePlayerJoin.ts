import { MinecraftPlayerJoinArgs } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";
import { WebSocket_Client_Map } from "../../../../controllers/websocket/auth.js";
import api from "../../../../index.js"

export default async function InsertPlayerJoin(args: MinecraftPlayerJoinArgs) {
    const { username, uuid, server, timestamp } = args;
    try { 

        const dbResults = await ForestBotApi.database.promisedQuery("SELECT * FROM users WHERE uuid = ? AND mc_server = ?", [uuid, server]);
        
        if (!dbResults || !dbResults.length) {
            await ForestBotApi.database.promisedQuery("INSERT INTO users(username, joindate, lastseen, uuid, joins, mc_server) VALUES (?,?,?,?,?,?)", [username, timestamp, timestamp, uuid, 1, server]);
            //first join send to correct websocket with mc server.
            const conn = WebSocket_Client_Map.get("minecraft"+server);
            conn.send(JSON.stringify({ action: "new_user", data: { user: username, server: server } }));
            return;
        }

        const existingUserUUID = dbResults[0].uuid;
        const existingUserName = dbResults[0].username;

        //user changed their name.
        if (uuid === existingUserUUID && existingUserName !== username) {
            await ForestBotApi.database.promisedQuery("UPDATE users SET username = ? WHERE username = ? AND uuid = ? AND mc_server = ?", [username, dbResults[0].username, uuid, server]);
            //user changed their name send to correct web socket.
            const conn = WebSocket_Client_Map.get("minecraft"+server);
            conn.send(JSON.stringify({ action: "new_name", data: { new_name: username, old_name: existingUserName, server: server } }));
        }

        await ForestBotApi.database.promisedQuery(
            "UPDATE users SET joins = joins + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?",
            [timestamp, uuid, server]
        );

        if (!api.playerSessions.get(server)) {
            api.playerSessions.set(server, []);
        }

        api.playerSessions.get(server).push({
            username: username,
            uuid: uuid,
            mc_server: server,
            timestamp: timestamp,
            join_time: timestamp,
            leave_time: "",
            playtime: 0,
            kills: 0,
            deaths: 0,
            advancements_gained: 0,
            messages_sent: 0
        });

        return;

    } catch (err) {
        console.error(err, " Player join error");
        
    }

};
