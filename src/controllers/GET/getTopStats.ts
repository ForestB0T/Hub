import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";

export default {
    method: "GET",
    url: "/topstat/:stat/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {
        const stat: string = req.params['stat'];
        const serv: string = req.params['server'];
        database.query(`SELECT username,${stat} from users WHERE mc_server = ? ORDER BY ${stat} DESC LIMIT 6`, [serv], (err, res) => {
            if (err || !res) return reply.code(501).send({ Error: "user not found." })
            reply.code(200).header('Content-Type', 'application/json').send({
                top_stat: res
            })
            return;
        })
    }
} as RouteItem;