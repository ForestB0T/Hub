import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";

export default {
    method: "GET",
    url: "/kd/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {
        const serv: string = req.params['server'];
        const user: string = req.params['user'];
        database.query(`SELECT kills,deaths from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].kills || !res[0].deaths) return reply.code(501).send({ Error: "user not found." })
            const kills: number = res[0].kills;
            const deaths: number = res[0].deaths;
            reply.code(200).header('Content-Type', 'application/json').send({
                kills: kills,
                deaths: deaths
            })
            return;
        })
    }
} as RouteItem;