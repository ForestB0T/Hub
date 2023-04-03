import { MinecraftChatAdvancement, MinecraftChatMessage } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

// let cachedMessages = [];
// let lastInsertTime = Date.now();

export default async function InsertChatAdvancement(args: MinecraftChatAdvancement) {
    const { username, advancement, mc_server, time, uuid } = args;
    try { 
        await ForestBotApi.database.promisedQuery(
            "INSERT INTO advancements (username, advancement, time, mc_server, uuid) VALUES (?,?,?,?,?)",
            [username, advancement, time, mc_server, uuid??null]
        );

    } catch (err) {
        console.error(err);
    }

};
