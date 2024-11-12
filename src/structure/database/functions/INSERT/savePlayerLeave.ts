import { MinecraftPlayerLeaveMessage } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

export default async function InsertPlayerLeave(args: MinecraftPlayerLeaveMessage) {
    const { username, server, timestamp, uuid} = args;

    try { 
        await ForestBotApi.database.promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE uuid = ? AND mc_server = ?", [timestamp, uuid, server]);

    } catch (err) {
        console.error(err, " Player leave error");
    }

};
