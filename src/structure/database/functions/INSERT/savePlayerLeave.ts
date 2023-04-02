import { MinecraftPlayerLeaveArgs } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

export default async function InsertPlayerLeave(args: MinecraftPlayerLeaveArgs) {
    const { username, mc_server, time } = args;
    try { 
        await ForestBotApi.database.promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE username = ? AND mc_server = ?", [time, username, mc_server]);

    } catch (err) {
        console.error(err, " Player leave error");
    }

};
