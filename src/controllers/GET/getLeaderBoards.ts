import { FastifyReply, FastifyRequest } from "fastify";
import { MinecraftChatMessage, RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

const leaderBoardQueries = {
    // top 5 pvpers
    SELECT_TOP_5_KILLERS: `
    SELECT murderer AS player_name, murdererUUID AS player_uuid,
    COUNT(*) AS kill_count
    FROM deaths
    WHERE type = 'pvp'
    AND mc_server = ?
    AND time >= UNIX_TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL ? DAY)) * 1000
    GROUP BY murderer
    ORDER BY kill_count DESC
    LIMIT 5;
    `,

    // top 5 pve deaths
    SELECT_TOP_5_PVE_DEATHS: `
    SELECT victim AS player_name, victimUUID AS player_uuid,
    COUNT(*) AS death_count
    FROM deaths
    WHERE type = 'pve'
    AND time >= UNIX_TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL ? DAY)) * 1000
    AND mc_server = ?
    GROUP BY victim
    ORDER BY death_count DESC
    LIMIT 5;
    `,

    // top 5 pvp deaths
    SELECT_TOP_5_PVP_DEATHS: `
    SELECT victim AS player_name, victimUUID AS player_uuid,
    COUNT(*) AS pvp_death_count
    FROM deaths
    WHERE type = 'pvp'
    AND time >= UNIX_TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL ? DAY)) * 1000
    AND mc_server = ?
    GROUP BY victim
    ORDER BY pvp_death_count DESC
    LIMIT 5;
    `,

    // top 5 users who got most advancements
    SELECT_TOP_5_ADVANCEMENTS: `
    SELECT username AS player_name, uuid AS player_uuid,
    COUNT(*) AS advancement_count
    FROM advancements
    WHERE time >= UNIX_TIMESTAMP(DATE_SUB(CURDATE(), INTERVAL ? DAY)) * 1000
    AND mc_server = ?
    GROUP BY username
    ORDER BY advancement_count DESC
    LIMIT 5;
    `,

    SELECT_TOP_5_PLAYTIME: `
    SELECT 
    username,
    uuid AS player_uuid,
    SUM(playtime) AS total_playtime
    FROM 
    sessions
    WHERE 
    join_time >= UNIX_TIMESTAMP(NOW() - INTERVAL ? DAY) * 1000
    AND leave_time <= UNIX_TIMESTAMP(NOW()) * 1000
    AND mc_server = ?
    GROUP BY 
    username, uuid
    ORDER BY 
    total_playtime DESC
    LIMIT 5;

    `

}

interface LeaderBoardData {
    kills?: Array<{
        player_name: string,
        player_uuid: string,
        kill_count: number
    }>,
    pve_deaths?: Array<{
        player_name: string,
        player_uuid: string,
        death_count: number
    }>,
    pvp_deaths?: Array<{
        player_name: string,
        player_uuid: string,
        pvp_death_count: number
    }>,
    advancements?: Array<{
        player_name: string,
        player_uuid: string,
        advancement_count: number
    }>,
    playtime?: Array<{
        player_name: string,
        player_uuid: string,
        total_playtime: number
    }>
}


/**
 * Route handler for fetching Minecraft chat messages.
 */
export default {
    method: "GET",
    url: "/leaderboards",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const { server, limit } = req.query as { server: string, limit: "1_week" | "1_month" };

        let leaderBoarddata = {} as LeaderBoardData;

        try {
            const days = limit === "1_week" ? 7 : 30;

            const topKillers = await database.promisedQuery(leaderBoardQueries.SELECT_TOP_5_KILLERS, [server, days]);
            const topPveDeaths = await database.promisedQuery(leaderBoardQueries.SELECT_TOP_5_PVE_DEATHS, [days, server]);
            const topPvpDeaths = await database.promisedQuery(leaderBoardQueries.SELECT_TOP_5_PVP_DEATHS, [days, server]);
            const topAdvancements = await database.promisedQuery(leaderBoardQueries.SELECT_TOP_5_ADVANCEMENTS, [days, server]);
            const topPlaytime = await database.promisedQuery(leaderBoardQueries.SELECT_TOP_5_PLAYTIME, [days, server]);
            leaderBoarddata = {
                kills: topKillers ?? [],
                pve_deaths: topPveDeaths ?? [],
                pvp_deaths: topPvpDeaths ?? [],
                advancements: topAdvancements ?? [],
                playtime: topPlaytime ?? []
                // logins: topLogins
            };

            reply.send(leaderBoarddata);
        } catch (error) {
            sendError(reply, error);
        }


    }
} as RouteItem;
