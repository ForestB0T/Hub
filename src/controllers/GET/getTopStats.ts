import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * Get the top 5 users statistics for a certain minecraft server
 */
export default {
    method: "GET",
    url: "/top-statistic",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const statistic: string = req.query['statistic'];
        const server: string = req.query['server'];
        const limit: number = req.query['limit'];

        database.Pool.query(`SELECT username,${statistic} from users WHERE mc_server = ? ORDER BY ${statistic} DESC LIMIT ?`, [server, Number(limit)], (err, res) => {
            if (err || !res) {
                sendError(reply, "No users found.");
                return;
            }
            reply.code(200).header('Content-Type', 'application/json').send({
                top_stat: res
            })
            return;
        })
    }
} as RouteItem;