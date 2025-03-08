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
            return;
        } else {
            const userSession = sessions.find(user => user.uuid === uuid);
            if (!userSession) {
                return;
            }

            if (username === "ForestBot") {
                const allUserSessionsForServer = api.playerSessions.get(server);
                for (const user of allUserSessionsForServer) {
                    await InsertPlayerSession(user);
                }

                api.playerSessions.set(server, []); // Clear all user sessions for this server.
                Logger.info(`Bot left the server ${server}, saving all user sessions to the database and cleared the sessions for this server.`);
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
