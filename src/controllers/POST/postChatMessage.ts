import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST",
    url: "/savechat/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        if (!checkPrivateKey(req.params['key'], reply)) return;

        const msg = req.body["message"],
            user = req.body["user"],
            mc_server = req.body["mc_server"];

        try {
            await database.promisedQuery(
                "INSERT INTO messages (name, message, date, mc_server) VALUES (?, ?, ?, ?)",
                [user, msg, Date.now(), mc_server]
            )

            reply.code(200).send({ success: true });

        } catch {
            reply.code(501).send({ Error: "error with database." });
            return;
        }
    }
} as RouteItem;