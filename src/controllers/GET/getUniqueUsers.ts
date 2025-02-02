import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * Get total message count.
 */
export default {
    method: "GET",
    url: "/unique-users",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const serv: string = req.query['server'];

        const query = `SELECT DISTINCT username,joindate FROM users WHERE mc_server = ?`;

        database.Pool.query(query, [serv], (err, result) => {
            if (err || !result[0]) {
                return sendError(reply, "No users found for this server.");
            }
            const transformedData = result.map((row: any) => {
                let jdt = row.joindate;
                if (/^\d+$/.test(jdt ?? "")) {
                    // joindate is all digits; parse and convert
                    jdt = new Date(Number(jdt)).toLocaleString();
                }
                return {
                    username: row.username,
                    joindate: jdt
                };
            });
            return reply.code(200).header('Content-Type', 'application/json').send(transformedData);
        })
    }
} as RouteItem;