import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * Get a random faq or a specific faq by id.
 */
export default {
    method: "GET",
    url: "/faq",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        try {
            const {
                id,
                server
            } = req.query as any;

            const query = !id ?
                `SELECT username, uuid, server, id, faq, timestamp, (SELECT MAX(id) FROM faq) AS total FROM faq ORDER BY RAND() LIMIT 1` :
                `SELECT username, uuid, server, id, faq, timestamp, (SELECT MAX(id) FROM faq) AS total FROM faq WHERE id = ?`;

            const result = await database.promisedQuery(query, [id]);

            if (!result[0]) {
                return reply.code(501).send({ Error: "faq not found." })
            }

            const replyData = {
                username: result[0].username,
                uuid: result[0].uuid,
                server: result[0].server,
                id: result[0].id,
                faq: result[0].faq,
                timestamp: result[0].timestamp,
                total: result[0].total

            };

            reply.code(200).header('Content-Type', 'application/json').send(replyData);
        } catch (err) {
            console.error(err);
            reply.status(500).send({ success: false, message: 'Internal Server Error' });
        }
    }
} as RouteItem;
