import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import levenshtein from "fastest-levenshtein";

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

        if (faq.startsWith("/")) {
            reply.code(400).send({ Error: "faq's cannot start with '/'" });
            return;
        }

        if (faq.length < 5) {
            reply.code(400).send({ Error: "faq's must be at least 5 characters long." });
            return;
        }

        const normalizeFaq = (text: string) => {
            return text 
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        const faqNormalized = normalizeFaq(faq);
        const now = Date.now();

        try {

            const existingFaqs = await database.promisedQuery(`SELECT faq FROM faq_test WHERE server = ?`, [server]);    

            for (const existingFaq of existingFaqs) {
                const existingFaqNormalized = normalizeFaq(existingFaq["faq"]);
                const distance = levenshtein.distance(faqNormalized, existingFaqNormalized);
                const maxDistance = Math.max(faqNormalized.length, existingFaqNormalized.length);
                const similarity = (1 - (distance / maxDistance)) * 100;
            
                if (similarity > 80) {
                    reply.code(400).send({ Error: "faq is too similar to an existing faq." });
                    return;
                }


            }

            const data = await database.promisedQuery(`
            INSERT INTO faq_test (username, faq, uuid, server, timestamp)
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