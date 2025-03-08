import { MinecraftAdvancementMessage } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

// let cachedMessages = [];
// let lastInsertTime = Date.now();

export default async function InsertChatAdvancement(args: MinecraftAdvancementMessage) {
    const { username, advancement, mc_server, time, uuid } = args;
    try { 
        await ForestBotApi.database.promisedQuery(
            "INSERT INTO advancements (username, advancement, time, mc_server, uuid) VALUES (?,?,?,?,?)",
            [username, advancement, time, mc_server, uuid??null]
        );

        const sessions = ForestBotApi.playerSessions.get(mc_server);
        if (sessions) {
            const userSession = sessions.find(user => user.username === username);
            if (userSession) {
                userSession.advancements_gained += 1
            }
        }

        return

    } catch (err) {
        console.error(err);
    }

};
