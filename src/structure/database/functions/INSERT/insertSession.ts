import { Sessions } from "../../../../..";
import ForestBotApi from "../../../../index.js";


export default async function InsertPlayerSession(userSession: Sessions) {
    try {
        await ForestBotApi.database.promisedQuery(
            "INSERT into sessions (username, uuid, mc_server, join_time, leave_time, playtime, kills, deaths, advancements_gained, messages_sent) VALUES (?,?,?,?,?,?,?,?,?,?)",
            [
                userSession.username,
                userSession.uuid,
                userSession.mc_server,
                userSession.join_time,
                userSession.timestamp,
                userSession.playtime,
                userSession.kills,
                userSession.deaths,
                userSession.advancements_gained,
                userSession.messages_sent
            ]
        )
    } catch (err) {
        console.error(err)
    }

}