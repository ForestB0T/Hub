import { FastifyReply, FastifyRequest } from "fastify";
import { allStats, RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * getting all users from a server by joindate, useful for !noobs command or !oldheads command
 */
export default {
    method: "GET",
    url: "/users-sorted-by-joindate",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const { server, order, limit, usernames } = req.query as { server: string, order: string, limit: string, usernames: string };
        if (order !== "ASC" && order !== "DESC"){
            sendError(reply, "Invalid order.");
            return;
        }

        const queryLimit = parseInt(limit, 10);
        if (isNaN(queryLimit) || queryLimit <= 0) {
            sendError(reply, "Invalid limit.");
            return;
        }

        const usernameArray = usernames.split(',').map(username => username.trim());
        if (usernameArray.length === 0) {
            sendError(reply, "No usernames provided.");
            return;
        }

        database.Pool.query(`SELECT * FROM users WHERE mc_server = ? AND username IN (?) ORDER BY CAST(joindate AS UNSIGNED) ${order} LIMIT ?`, [server, usernameArray, queryLimit], (err, res) => {
            if (err || !res.length){
                sendError(reply, "No users found.");
                return;
            }
            const users = res.map((user: allStats) => ({
                username: user.username,
                kills: user.kills,
                deaths: user.deaths,
                joindate: user.joindate, // Ensure joindate is a string
                lastseen: user.lastseen,
                uuid: user.uuid,
                playtime: user.playtime,
                joins: user.joins,
                leaves: user.joins,
                lastdeathTime: user.lastdeathTime,
                lastdeathString: user.lastdeathString,
                mc_server: server
            }));
            reply.code(200).header('Content-Type', 'application/json').send(users);
            return;
        });
    }
} as RouteItem;