import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/lastseen/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const serv: string = req.params['server'];
        const user: string = req.params['user'];
        database.Pool.query(`SELECT lastseen from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].lastseen) return reply.code(501).send({ Error: "user not found." })
            const data: string = res[0].lastseen
            reply.code(200).header('Content-Type', 'application/json').send({ lastseen: data })
            return;
        })
    }
} as RouteItem;