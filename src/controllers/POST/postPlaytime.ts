import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool.js";


export default {
    method: "POST",
    url: "/saveplaytime/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        if (!checkPrivateKey(req.params['key'], reply)) return;

        const mc_server = req.body["mc_server"]
        const players = req.body["players"] as string[];

        try {

            await database.promisedQuery(
                "UPDATE users SET playtime = playtime + 60000 WHERE username IN (?) AND mc_server = ?",
                [players, mc_server]
            )

            await reply.code(200).send({ success: true });
            return;
        } catch (err) {
            await reply.code(501).send({ Error: "error with database." });
            return;
        }

    }
} as RouteItem;