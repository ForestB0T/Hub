
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * This route will get uuid from a username.
 */

export default {
    method: "GET",
    url: "/convert-username-to-uuid",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        try {
            const username = req.query["username"];

            const data = await database.promisedQuery(`
                  SELECT uuid FROM users
                  WHERE username = ?
                  LIMIT 1
                `, [username]);
            if (!data || data.length === 0) {
                return reply.code(404).send({ error: "No data found." });
            }
            const replyData = {
                uuid: data[0].uuid
            };
            reply.code(200).header('Content-Type', 'application/json').send(replyData);
        } catch (err) {
            console.error(err);
            reply.status(500).send({ success: false, message: 'Internal Server Error' });
        }
    }
} as RouteItem;
