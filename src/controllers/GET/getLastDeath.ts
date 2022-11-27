import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/lastdeath/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const user: string = req.params['user'];
        const serv: string = req.params['server'];
        database.Pool.query(`SELECT lastdeathTime,lastdeathString from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0].lastdeathTime || !res[0].lastdeathString) return reply.code(200).header('Content-Type', 'application/json').send({ error: "user not found" });
            const lastdeathString: string = res[0].lastdeathString;
            const lastdeathTime: number = res[0].lastdeathTime;
            return reply.code(200).header('Content-Type', 'application/json').send({
                death: lastdeathString,
                time: lastdeathTime
            })
        })
    }
} as RouteItem;