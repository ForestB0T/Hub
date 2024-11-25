import { FastifyReply, FastifyRequest } from "fastify";
import { database } from "../../structure/database/createPool.js";


export default {
    method: "GET",
    url: "/all-user-stats",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        try {

            const { uuid } = req.query as any;

            const data = await database.promisedQuery(`
                SELECT * FROM users WHERE uuid = ?
            `, [uuid]);

            if (!data) {
                return reply.code(404).send({ error: "No data found." });
            }

            reply.code(200).header('Content-Type', 'application/json').send(data);
        } catch (err) {
            console.error(err);
            reply.status(500).send({ success: false, message: 'Internal Server Error' });
        }

    }
}