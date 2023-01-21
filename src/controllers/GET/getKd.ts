import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/kd/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const serv: string = req.params['server'];
        const user: string = req.params['user'];
        database.Pool.query(`SELECT kills,deaths from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0]) return reply.code(501).send({ Error: "user not found." })
            const kills: number = res[0].kills ? res[0].kills : 0;
            const deaths: number = res[0].deaths ? res[0].deaths : 0;            
            reply.code(200).header('Content-Type', 'application/json').send({
                kills: kills,
                deaths: deaths
            })
            return;
        })
    }
} as RouteItem;