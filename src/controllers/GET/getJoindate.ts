import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/joindate/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const serv: string = req.params['server'];
        const user: string = req.params['user'];
        database.Pool.query(`SELECT joindate from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].joindate) return reply.code(501).send({ Error: "user not found." })
            const data: string = res[0].joindate;
            reply.code(200).header('Content-Type', 'application/json').send({ joindate: data })
            return;
        })
    }
} as RouteItem;