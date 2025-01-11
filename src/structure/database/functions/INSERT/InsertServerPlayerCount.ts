import { MinecraftChatMessage } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

/**
 * This function will insert all the servers player counts each hour.
 * @param count 
 * @param mc_server 
 */
export default async function InsertServerPlayerCount(count: number, mc_server: string) {

    try { 
        await ForestBotApi.database.promisedQuery(
            "INSERT INTO server_player_counts (count, mc_server, timestamp) VALUES (?,?,?)",
            [count, mc_server, `${Date.now()}`]
        )

        return

    } catch (err) {
        console.error(err);
    }

};
