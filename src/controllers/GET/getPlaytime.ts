import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET", 
    url: "/playtime/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const serv: string = req.params['server'];
        const user: string = req.params['user'];

        database.Pool.query(`SELECT playtime from users WHERE username = ? and mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].playtime) return reply.code(501).send({ Error: "user not found." })
            const data = {
                playtime: res[0].playtime
            }
            reply.code(200).header('Content-Type', 'application/json').send(data)
            return;
        })
    }
} as RouteItem;