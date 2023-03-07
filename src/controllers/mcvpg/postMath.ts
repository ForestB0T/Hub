import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import api from "../../index.js";
import type { database } from "../../structure/database/createPool";


export default {
    method: "POST", 
    url: "/mcvpg-save-math/:key",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (req.params['key'] !== process.env.mcvpgKey) return;

        const user = req.body["username"];
        const hasSolved = req.body["hasSolved"];
    
        try {
            await database.promisedQuery(
                "INSERT INTO mcvpgmath (username, solved_count, wrong_count) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE solved_count = solved_count + ?, wrong_count = wrong_count + ?",
                [user, hasSolved ? 1 : 0, hasSolved ? 0 : 1, hasSolved ? 1 : 0, hasSolved ? 0 : 1]
            );
            reply.send({ success: true });
        } catch (err) {
            console.error(err);
            reply.status(500).send({ success: false, message: 'Internal Server Error' });
        }
    
        return;

    }
} as RouteItem;