import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST", 
    url: "/iam/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const user      = req.body["user"], 
              description = req.body["description"]

        console.log(user, description)
        const now = Date.now();
        try {
            await database.promisedQuery(`
            INSERT INTO whois (username, description, timestamp)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE description = VALUES(description), timestamp = ?
          `, [user, description, now, now]);            reply.code(200).send({ success: true })
            return;
        } catch (err) {
            console.error(err)
            reply.code(200).send({ Error: "Database Error while updating user leave." });
            return;
     
        }
    }
} as RouteItem;