import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * Getting a users wordcount
 */
export default {
    method: "GET",
    url: "/wordcount",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const word: string = req.query["word"];
        const serv: string = req.query['server'];
        const user: string = req.query['username'];

        database.Pool.query(`
        SELECT NAME, message, COUNT(*) as word_count
        FROM messages
        WHERE mc_server = ? AND name = ? AND message LIKE '%${word}%'
        GROUP BY name

        `, [serv, user, word], (err, res) => {
            if (err || !res[0] || !res[0].word_count) {
                sendError(reply, "No messages found for this user.");
                return;
            }
            const data = {
                name: user,
                count: res[0].word_count,
                word: word
            }
            reply.code(200).header('Content-Type', 'application/json').send(data)
            return;
        })
    }
} as RouteItem;