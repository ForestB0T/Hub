import { MinecraftPlayerLeaveMessage } from "../../../../../index.js";
import api from "../../../../index.js";
import InsertPlayerSession from "./insertSession.js";

export default async function InsertPlayerLeave(args: MinecraftPlayerLeaveMessage) {
    const { username, server, timestamp, uuid } = args;

    try {
        await api.database.promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?", [timestamp, uuid, server]);

        // we want to remove the player from the session list,
        // while taking the data from the session list and saving it in sessions table.
        // const userSessions = api.playerSessions.get(server);
        // const userCompletedSession = userSessions.

        const sessions = api.playerSessions.get(server);
        if (!sessions) {
            console.error("No sessions found for server: ", server);
            return;
        } else {
            const userSession = sessions.find(user => user.uuid === uuid);
            if (!userSession) {
                console.error("No session found for user: ", username);
                return;
            }

            // save to database i guess :P first ima make a type for the database table

            await InsertPlayerSession(userSession);


            const updatedSessons = api.playerSessions.get(server).filter((session) => session.uuid !== uuid);
            api.playerSessions.set(server, updatedSessons);

            return
        }

    } catch (err) {
        console.error(err, " Player leave error");
    }

};
