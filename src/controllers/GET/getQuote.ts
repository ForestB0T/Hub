import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/quote/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const user: string = req.params['user'];
        const serv: string = req.params['server'];
        database.Pool.query(`SELECT name,message,date FROM messages WHERE name=? AND mc_server = ? AND LENGTH(message) > 30 ORDER BY RAND() LIMIT 1`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].message || !res[0].date) return reply.code(501).send({ Error: "user not found." })
            const count = res[0].message;
            const date = res[0].date;
            return reply.code(200).header('Content-Type', 'application/json').send({
                message: count,
                date: date
            })
        })
    }
} as RouteItem;