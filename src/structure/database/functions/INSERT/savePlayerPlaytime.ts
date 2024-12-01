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

        const server = args[0].server;

        if (ForestBotApi.playerSessions.has(server)) {
            const sessions = ForestBotApi.playerSessions.get(server);

            for (const player of args) {
                const session = sessions.find(s => s.uuid === player.uuid);
                if (session) {
                    session.playtime += 60000;
                } else {
                    sessions.push({
                        uuid: player.uuid,
                        playtime: 60000,
                        username: player.username,
                        mc_server: server,
                        join_time: Date.now().toString(),
                        leave_time: "",
                        kills: 0,
                        deaths: 0,
                        advancements_gained: 0,
                        messages_sent: 0,
                        timestamp: ""
                    });
                }
            }
        }

    } catch (err) { 
        Logger.error(`Database query failed: ${err.message}`);
    }

};
