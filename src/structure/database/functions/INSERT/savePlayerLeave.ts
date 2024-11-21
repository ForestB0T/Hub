import { MinecraftPlayerLeaveMessage } from "../../../../../index.js";
import api from "../../../../index.js";

export default async function InsertPlayerLeave(args: MinecraftPlayerLeaveMessage) {
    const { username, server, timestamp, uuid} = args;

    try { 
        await api.database.promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?", [timestamp, uuid, server]);

        // we want to remove the player from the session list,
        // while taking the data from the session list and saving it in sessions table.
        // const userSessions = api.playerSessions.get(server);
        // const userCompletedSession = userSessions.

        const userSession = api.playerSessions.get(server).find((session) => session.uuid === uuid);
        if (!userSession) {
            console.error("User session not found.");
            return;
        }

        // save to database i guess :P first ima make a type for the database table

        await api.database.promisedQuery(
            "INSERT into sessions (username, uuid, mc_server, join_time, leave_time, playtime, kills, deaths, advancements_gained, messages_sent) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [
                userSession.username,
                userSession.uuid,
                userSession.mc_server,
                userSession.join_time,
                timestamp,
                userSession.playtime,
                userSession.kills,
                userSession.deaths,
                userSession.advancements_gained,
                userSession.messages_sent
            ]
        )

        
        const updatedSessons = api.playerSessions.get(server).filter((session) => session.uuid !== uuid);
        api.playerSessions.set(server, updatedSessons); 

        return

    } catch (err) {
        console.error(err, " Player leave error");
    }

};
