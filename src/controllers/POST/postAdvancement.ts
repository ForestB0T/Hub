import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import api from "../../index.js";
import type { database } from "../../structure/database/createPool";


export default {
    method: "POST", 
    url: "/saveadvancement/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const user = req.body["user"];
        const advancement = req.body["advancement"]
        const mc_server = req.body["mc_server"];

        try {
            await database.promisedQuery(
                "INSERT INTO advancements (username, advancement, time, mc_server) VALUES (?,?,?,?)",
                [user, advancement, Date.now(), mc_server]
            )
        } catch (err) {
            await reply.code(501).send({ Error: "database error"});
            return;
        }

        await reply.code(200).send({ status: "success" })
        return 

    }
} as RouteItem;