import { MinecraftPlayerJoinArgs } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";
import { WebSocket_Client_Map } from "../../../../controllers/websocket/auth.js";
import api from "../../../../index.js"
import InsertPlayerSession from "./insertSession.js";

export default async function InsertPlayerJoin(args: MinecraftPlayerJoinArgs) {
    const { username, uuid, server, timestamp } = args;
    try {

        const dbResults = await ForestBotApi.database.promisedQuery("SELECT * FROM users WHERE uuid = ? AND mc_server = ?", [uuid, server]);

        if (!dbResults || !dbResults.length) {
            await ForestBotApi.database.promisedQuery("INSERT INTO users(username, joindate, lastseen, uuid, joins, mc_server) VALUES (?,?,?,?,?,?)", [username, timestamp, timestamp, uuid, 1, server]);
            //first join send to correct websocket with mc server.
            const conn = WebSocket_Client_Map.get("minecraft" + server);
            conn.send(JSON.stringify({ action: "new_user", data: { user: username, server: server } }));
            return;
        }

        const existingUserUUID = dbResults[0].uuid;
        const existingUserName = dbResults[0].username;

        //user changed their name.
        if (uuid === existingUserUUID && existingUserName !== username) {
            await ForestBotApi.database.promisedQuery("UPDATE users SET username = ? WHERE username = ? AND uuid = ? AND mc_server = ?", [username, dbResults[0].username, uuid, server]);
            //user changed their name send to correct web socket.
            const conn = WebSocket_Client_Map.get("minecraft" + server);
            conn.send(JSON.stringify({ action: "new_name", data: { new_name: username, old_name: existingUserName, server: server } }));
        }

        await ForestBotApi.database.promisedQuery(
            "UPDATE users SET joins = joins + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?",
            [timestamp, uuid, server]
        );


        let sessions = api.playerSessions.get(server) || [];
        
        if (!api.playerSessions.has(server)) {
            api.playerSessions.set(server, sessions);
        }

        const userSession = sessions.find(user => user.uuid === uuid);

        if (userSession) {
            console.warn(`User ${uuid} already in session list. Resetting their session.`);

            // Save the existing session to the database
            await InsertPlayerSession(userSession);

            // Remove the user from the session list
            sessions = sessions.filter(session => session.uuid !== uuid);
        }

        // Add a fresh session with new stats
        sessions.push({
            username,
            uuid,
            mc_server: server,
            timestamp,
            join_time: timestamp,
            leave_time: null, // Use `null` for clarity
            playtime: 0,
            kills: 0,
            deaths: 0,
            advancements_gained: 0,
            messages_sent: 0
        });

        api.playerSessions.set(server, sessions);

        return

    } catch (err) {
        console.error(err, " Player join error");

    }

};
