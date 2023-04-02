import { MinecraftChatMessage, MinecraftPlayerJoinArgs } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";
import { WebSocket_Client_Map } from "../../../../controllers/websocket/auth.js";
// let cachedMessages = [];
// let lastInsertTime = Date.now();

export default async function InsertPlayerJoin(args: MinecraftPlayerJoinArgs) {
    const { user, uuid, mc_server, time } = args;
    try { 
        const dbResults = await ForestBotApi.database.promisedQuery("SELECT * FROM users WHERE uuid = ? AND mc_server = ?", [uuid, mc_server]);
        console.log(dbResults);
        if (!dbResults || !dbResults.length) {
            await ForestBotApi.database.promisedQuery("INSERT INTO users(username, joindate, uuid, joins, mc_server) VALUES (?,?,?,?,?)", [user, time, uuid, 1, mc_server]);
            //first join send to correct websocket with mc server.
            const conn = WebSocket_Client_Map.get("minecraft"+mc_server);
            conn.socket.send(JSON.stringify({ data: { new_user: true, username: user } }));
            return;
        }

        const existingUserUUID = dbResults[0].uuid;
        const existingUserName = dbResults[0].username;

        //user changed their name.
        if (uuid === existingUserUUID && existingUserName !== user) {
            await ForestBotApi.database.promisedQuery("UPDATE users SET username = ? WHERE username = ? AND uuid = ? AND mc_server = ?", [user, dbResults[0].username, uuid, mc_server]);
            //user changed their name send to correct web socket.
            const conn = WebSocket_Client_Map.get("minecraft"+mc_server);
            conn.socket.send(JSON.stringify({ data: { name_changed: true, new_name: user, old_name: existingUserName }}));
        }

        await ForestBotApi.database.promisedQuery(
            "UPDATE users SET joins = joins + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?",
            [time, uuid, mc_server]
        );

        return;

    } catch (err) {
        console.error(err, " Player join error");
    }

};
