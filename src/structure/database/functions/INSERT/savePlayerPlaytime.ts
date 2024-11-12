import { PlayerList } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";
import Logger from "../../../logger/Logger.js";

export default async function InsertPlayerPlaytime(args: PlayerList[]) {

    const usernames = args.map(p => p.username);

    try {
        await ForestBotApi.database.promisedQuery(
            "UPDATE users SET playtime = playtime + 60000 WHERE username IN (?) AND mc_server = ?",
            [usernames, args[0].server]
        )
    } catch (err) { 
        Logger.error(`Database query failed: ${err.message}`);
    }

};
