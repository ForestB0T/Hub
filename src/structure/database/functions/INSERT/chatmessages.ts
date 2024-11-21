import { MinecraftChatMessage } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

// let cachedMessages = [];
// let lastInsertTime = Date.now();

export default async function InsertChatMessage(args: MinecraftChatMessage) {
    const { name, message, mc_server, date } = args;

    try { 
        await ForestBotApi.database.promisedQuery(
            "INSERT INTO messages (name, message, date, mc_server) VALUES (?,?,?,?)",
            [name, message, date, mc_server]
        )

        const sessions = ForestBotApi.playerSessions.get(mc_server)
        if (sessions) {
            const userSession = sessions.find(user => user.username === name)
            if (userSession) {
                userSession.messages_sent += 1
            }
        }

    } catch (err) {
        console.error(err);
    }

};
