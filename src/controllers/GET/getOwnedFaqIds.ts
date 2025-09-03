import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * Get all FAQ IDs owned by a user on a specific server
 * @Query name: string
 * @Query server: string
 */
export default {
    method: "GET",
    url: "/get-owned-faq-ids",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const { name } = req.query as { name: string; };

        try {
            const faqs = await database.promisedQuery(
                `SELECT id, faq FROM faq WHERE username = ?`,
                [name]
            );

            if (!faqs || faqs.length === 0) {
                sendError(reply, "No FAQs found for this user.");
                return;
            }

            return reply.code(200).send({
                faqs: faqs.map((f: any) => ({ id: f.id, faq: f.faq })),
            });
        } catch (err) {
            console.error(err);
            sendError(reply, "Database error while fetching FAQs.");
        }
    },
} as RouteItem;
