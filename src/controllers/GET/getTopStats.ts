import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/top-statistic",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const statistic: string = req.query['statistic'];
        const server: string = req.query['server'];
        const limit: number = req.query['limit'];

        database.Pool.query(`SELECT username,${statistic} from users WHERE mc_server = ? ORDER BY ${statistic} DESC LIMIT ?`, [server, Number(limit)], (err, res) => {
            if (err || !res) {
                console.log(err)
                return reply.code(501).send({ Error: "user not found." })
            }
            reply.code(200).header('Content-Type', 'application/json').send({
                top_stat: res
            })
            return;
        })
    }
} as RouteItem;