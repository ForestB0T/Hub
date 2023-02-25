import { FastifyReply, FastifyRequest } from "fastify";
import { allStats, RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/user/:user/:server",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const serv: string = req.params['server'];
        const user: string = req.params['user'];
        database.Pool.query(`SELECT * from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
            if (err || !res[0] || !res[0].username) return reply.code(501).send({ Error: "user not found." })
            const i: allStats = res[0];
            reply.code(200).header('Content-Type', 'application/json').send({
                username: i.username,
                kills: i.kills,
                deaths: i.deaths,
                joindate: i.joindate,
                lastseen: i.lastseen,
                uuid: i.uuid,
                playtime: i.playtime,
                joins: i.joins,
                leaves: i.joins,
                lastdeathString: i.lastdeathString,
                lastdeathTime: i.lastdeathTime,
                id: i.id,
                mc_server: serv
            })
            return;
        })
    }
} as RouteItem;