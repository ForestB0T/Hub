import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";

export default {
    method: "GET", 
    url: "/playtime/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {

        const serv: string = req.params['server'];
        const user: string = req.params['user'];

        database.query(`SELECT playtime from users WHERE username = ? and mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].playtime) return reply.code(501).send({ Error: "user not found." })
            const data = {
                playtime: res[0].playtime
            }
            reply.code(200).header('Content-Type', 'application/json').send(data)
            return;
        })
    }
} as RouteItem;