import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../..";
import { database } from "../../../structure/database/createPool";

export default {
    method: "GET",
    url: "/mcvpg-math-topsolved",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        database.Pool.query(`SELECT username,solved_count from mcvpgmath ORDER BY solved_count DESC LIMIT 5`, (err, res) => {
            if (err || !res) return reply.code(501).send({ Error: "user not found." })
            reply.code(200).header('Content-Type', 'application/json').send({
                top_stat: res
            })
            return;
        })
    }
} as RouteItem;
