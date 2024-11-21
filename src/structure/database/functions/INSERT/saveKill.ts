import { MinecraftPlayerDeath } from "../../../../../index.js";
import ForestBotApi from "../../../../index.js";

// let cachedMessages = [];
// let lastInsertTime = Date.now();

export default async function InsertMinecraftDeath(args: MinecraftPlayerDeath) {
    const { victim, death_message, murderer, time, type, mc_server, murdererUUID = null, victimUUID = null } = args;

    try {
        //this was a pvp kill
        if (murderer) {
            await ForestBotApi.database.promisedQuery(
                "UPDATE users SET deaths = deaths + 1, lastdeathString = ?, lastdeathTime = ? WHERE username = ? AND mc_server = ?",
                [death_message, time, victim, mc_server]
            )
    
            await ForestBotApi.database.promisedQuery(
                "UPDATE users SET kills = kills + 1 WHERE username = ? AND mc_server = ?",
                [murderer, mc_server]
            )
    
            await ForestBotApi.database.promisedQuery(
                "INSERT into deaths (victim, death_message, murderer, time, type, mc_server, victimUUID, murdererUUID) VALUES (?,?,?,?,?,?,?,?)",
                [victim, death_message, murderer, time, "pvp", mc_server, victimUUID, murdererUUID]
            )

            const sessions = ForestBotApi.playerSessions.get(mc_server)
            if (sessions) {
                const userMurdererSesson = sessions.find(user => user.uuid === murdererUUID)
                const userVictimSession = sessions.find(user => user.uuid === victimUUID)
    
                if (userMurdererSesson && userVictimSession) {
                    userMurdererSesson.kills += 1
                    userVictimSession.deaths += 1
                }

            }

        } else {
            await ForestBotApi.database.promisedQuery(
                "UPDATE users SET deaths = deaths + 1, lastdeathString = ?, lastdeathTime = ? WHERE username = ? AND mc_server = ?",
                [death_message, time, victim, mc_server],
            )

            await ForestBotApi.database.promisedQuery(
                "INSERT into deaths (victim, death_message, time, type, mc_server, victimUUID) VALUES (?, ?, ?, ?, ?, ?)",
                [victim, death_message, time, "pve", mc_server, victimUUID]
            )

            const sessions = ForestBotApi.playerSessions.get(mc_server)
            if (sessions) {
                const userVictimSession = sessions.find(user => user.uuid === victimUUID)
                if (userVictimSession) {
                    userVictimSession.deaths += 1
                }
            }

        }

        return true;


    } catch (err) {
        console.error(err, "Error saving death or kill.");
        return null;
    }

};
