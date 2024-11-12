import { MinecraftAdvancementMessage } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

// let cachedMessages = [];
// let lastInsertTime = Date.now();

export default async function InsertChatAdvancement(args: MinecraftAdvancementMessage) {
    const { username, advancement, mc_server, time, uuid } = args;
    console.log(username, advancement, mc_server, time, uuid, " advancement shit")
    try { 
        await ForestBotApi.database.promisedQuery(
            "INSERT INTO advancements (username, advancement, time, mc_server, uuid) VALUES (?,?,?,?,?)",
            [username, advancement, time, mc_server, uuid??null]
        );

    } catch (err) {
        console.error(err);
    }

};
