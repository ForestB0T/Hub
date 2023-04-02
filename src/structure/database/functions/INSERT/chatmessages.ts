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

    } catch (err) {
        console.error(err);
    }

};
