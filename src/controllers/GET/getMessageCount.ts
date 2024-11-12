import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/messagecount",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const user: string = req.query['username'];
        const serv: string = req.query['server'];


        database.Pool.query(`SELECT name,COUNT(name) AS cnt FROM messages WHERE name=? AND mc_server = ? HAVING cnt > 1`, [user, serv], (err, result) => {
            if (err || !result[0] || !result[0].cnt) return reply.code(501).send({ Error: "user not found." })
            const count: number = result[0].cnt;
            return reply.code(200).header('Content-Type', 'application/json').send({
                count: count
            })
        })
    }
} as RouteItem;