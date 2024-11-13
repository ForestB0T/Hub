import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST",
    url: "/post-faq",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const username = req.body["username"],
            faq = req.body["faq"],
            uuid = req.body["uuid"],
            server = req.body["server"]

        if (faq.includes("/")) {
            reply.code(400).send({ Error: "faq's cannot contain '/'" });
            return;
        }

        const now = Date.now();

        try {
            const data = await database.promisedQuery(`
            INSERT INTO faq (username, faq, uuid, server, timestamp)
            VALUES (?, ?, ?, ?, ?)
          `, [username, faq, uuid, server, now]);

            reply.code(200).send({ id: data.insertId })

            return;
        } catch (err) {
            console.error(err)
            reply.code(200).send({ Error: "Database Error while adding a faq." });
            return;
        }
    }
} as RouteItem;