import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * Here we can get a random message from a user
 * @Query name: string
 * @Query server: string
 * @Query random: boolean
 * @Query phrase: string (optional)
 * 
 */
export default {
    method: "GET",
    url: "/quote",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const { name, server, random, phrase } = req.query as { name: string, server: string, random: boolean, phrase?: string }

        let query = `SELECT name,message,date,mc_server FROM messages WHERE `;
        let params: (string | boolean)[] = [];

        if (random) {
            query += `mc_server = ? `;
            params.push(server);
            if (phrase) {
                query += `AND message LIKE ? `;
                params.push(`%${phrase}%`);
            }
            query += `AND LENGTH(message) > 30 ORDER BY RAND() LIMIT 1`;
        } else {
            query += `name=? AND mc_server = ? AND LENGTH(message) > 20 ORDER BY RAND() LIMIT 1`;
            params.push(name, server);
        }

        database.Pool.query(query, params, (err, res) => {
            if (err || !res[0] || !res[0].message) {
                sendError(reply, "No messages found for this user.");
                return;
            }
            const count = res[0].message;
            const date = res[0].date;
            const name = res[0].name;
            return reply.code(200).header('Content-Type', 'application/json').send({
                message: count,
                date: date,
                name: name,
            })
        })
    }
} as RouteItem;