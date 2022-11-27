import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST",
    url: "/savechat/:key",
    json: true,
    isPrivate: true,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {

        if (!checkPrivateKey(req.params['key'], reply)) return;

        const msg = req.body["message"],
            user = req.body["user"],
            mc_server = req.body["mc_server"];

        database.Pool.query(
            `INSERT INTO messages (name, message, date, mc_server) VALUES (?, ?, ?, ?)`,
            [user, msg, Date.now(), mc_server],
            (err, res) => {
                if (err) {
                    console.error(err);
                    reply.code(501).send({ Error: "error with database." });
                    return;
                }
                reply.code(200).send({ success: true });
                return
            });
    }
} as RouteItem;