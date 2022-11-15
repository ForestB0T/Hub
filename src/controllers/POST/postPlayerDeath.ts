import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";

export default {
    method: "POST", 
    url: "/savepvekill/:key",
    json: true,
    isPrivate: true,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {

        if (!checkPrivateKey(req.params['key'], reply)) return;

        const user    = req.body['victim'],
            deathmsg  = req.body["deathmsg"],
            mc_server = req.body["mc_server"];
    
        database.query(
            "UPDATE users SET deaths = deaths + 1, lastdeathString = ?, lastdeathTime = ? WHERE username = ? AND mc_server = ?",
            [deathmsg, Date.now(), user, mc_server],
            (err, res) => {
                if (err) {
                    reply.code(501).send({ Error: "error with database." });
                    return;
                }
                reply.code(200).send({ success: true });
                return
            }
        )
    }
} as RouteItem;


