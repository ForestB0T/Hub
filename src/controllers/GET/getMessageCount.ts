import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";

export default {
    method: "GET",
    url: "/messagecount/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {
        const user: string = req.params['user'];
        const serv: string = req.params['server'];
        database.query(`SELECT name,COUNT(name) AS cnt FROM messages WHERE name=? AND mc_server = ? HAVING cnt > 1`, [user, serv], (err, result) => {
            if (err || !result[0] || !result[0].cnt) return reply.code(501).send({ Error: "user not found." })
            const count: number = result[0].cnt;
            return reply.code(200).header('Content-Type', 'application/json').send({
                messagecount: count
            })
        })
    }
} as RouteItem;