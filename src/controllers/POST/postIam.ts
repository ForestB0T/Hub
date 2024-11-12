import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST", 
    url: "/whois-description",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const user      = req.body["username"], 
              description = req.body["description"]

        if (description.includes("/")) {
            reply.code(400).send({ Error: "Description cannot contain '/'" });
            return;
        }
        
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