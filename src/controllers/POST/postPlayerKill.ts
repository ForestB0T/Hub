import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST", 
    url: "/savepvpkill/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        if (!checkPrivateKey(req.params['key'], reply)) return;

        const 
            murderer    = req.body["murderer"],
            victim    = req.body['victim'],
            deathmsg  = req.body["deathmsg"],
            mc_server = req.body["mc_server"];


        try {
            await database.promisedQuery(
                "UPDATE users SET deaths = deaths + 1, lastdeathString = ?, lastdeathTime = ? WHERE username = ? AND mc_server = ?",
                [deathmsg, Date.now(), victim, mc_server]
            )

            await database.promisedQuery(
                "UPDATE users SET kills = kills + 1 WHERE username = ? AND mc_server = ?",
                [murderer, mc_server]
            )

            await reply.code(200).send({ success: true });
            return

        } catch (err) {
            await reply.code(501).send({ Error: "error with database." });
            return;
        }
    
    }
} as RouteItem;


