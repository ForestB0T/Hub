import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/wordcount/:word/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const word: string = req.params["word"];
        const serv: string = req.params['server'];
        const user: string = req.params['user'];

        database.Pool.query(`
        SELECT NAME, message, COUNT(*) as word_count
        FROM messages
        WHERE mc_server = ? AND name = ? AND message LIKE '%${word}%'
        GROUP BY name

        `, [serv, user, word], (err, res) => {
            if (err || !res[0] || !res[0].word_count) return reply.code(501).send({ Error: "user not found." })
            const data = {
                word_count: res[0].word_count
            }
            reply.code(200).header('Content-Type', 'application/json').send(data)
            return;
        })
    }
} as RouteItem;