import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";

export default {
    method: "POST", 
    url: "/saveplaytime/:key",
    json: true,
    isPrivate: true,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {

        if (!checkPrivateKey(req.params['key'], reply)) return;

        const user    = req.body["user"],
            mc_server = req.body["mc_server"]
    
        database.query(
            "UPDATE users SET playtime = playtime + 60000 WHERE username=? AND mc_server=?",
            [user, mc_server],
            (err, res) => {
                if (err) {
                    reply.code(501).send({ Error: "error with database." });
                    return;
                }
                reply.code(200).send({ success: true });
                return;
            }
        )

        return;
    }
} as RouteItem;