import { MinecraftPlayerLeaveMessage } from "../../../../../index.js";
import api from "../../../../index.js";
import Logger from "../../../logger/Logger.js";
import InsertPlayerSession from "./insertSession.js";

export default async function InsertPlayerLeave(args: MinecraftPlayerLeaveMessage) {
    const { username, server, timestamp, uuid } = args;

    try {
        await api.database.promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?", [timestamp, uuid, server]);

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

            if (username === "ForestBot") {
                const allUserSessionsForServer = api.playerSessions.get(server);
                for (const user of allUserSessionsForServer) {
                    await InsertPlayerSession(user);
                }
                Logger.info(`Bot left the server ${server}, saving all user sessions to the database.`);
            } else {
                await InsertPlayerSession(userSession);
            }

            const updatedSessons = api.playerSessions.get(server).filter((session) => session.uuid !== uuid);
            api.playerSessions.set(server, updatedSessons);

            return;
        }

    } catch (err) {
        Logger.error(`Error while trying to update player leave for ${username} on ${server}.`, err);
    }

};
