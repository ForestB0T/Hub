import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST", 
    url: "/updateleave/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const user      = req.body["user"], 
              mc_server = req.body["mc_server"], 
              time      = req.body["time"];
    
        try {
            await database.promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE username = ? AND mc_server = ?", [time, user, mc_server]);
            reply.code(200).send({ success: true })
            return;
        } catch (err) {
            reply.code(200).send({ Error: "Database Error while updating user leave." });
            return;
     
        }
    }
} as RouteItem;