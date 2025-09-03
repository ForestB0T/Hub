import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";
import levenshtein from "fastest-levenshtein";

export default {
    method: "POST",
    url: "/edit-faq",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const { username, faq, uuid, server, id } = req.body as any;

        if (!id) {
            sendError(reply, "FAQ ID is required to edit.");
            return;
        }

        if (faq.startsWith("/")) {
            sendError(reply, "FAQ's cannot start with '/'");
            return;
        }

        if (faq.length < 5) {
            sendError(reply, "FAQ's must be at least 5 characters long.");
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
            // Verify the user owns the FAQ
            const checkFaq = await database.promisedQuery(
                `SELECT * FROM faq WHERE id = ? AND username = ?`,
                [id, username]
            );

            if (!checkFaq[0]) {
                sendError(reply, "You do not own this FAQ or it does not exist.");
                return;
            }

            // Check similarity with other FAQs on the server (excluding the one being edited)
            const existingFaqs = await database.promisedQuery(
                `SELECT faq FROM faq WHERE id != ?`,
                [server, id]
            );

            for (const existingFaq of existingFaqs) {
                const existingFaqNormalized = normalizeFaq(existingFaq["faq"]);
                const distance = levenshtein.distance(faqNormalized, existingFaqNormalized);
                const maxDistance = Math.max(faqNormalized.length, existingFaqNormalized.length);
                const similarity = (1 - (distance / maxDistance)) * 100;
                if (similarity > 80) {
                    sendError(reply, "FAQ is too similar to an existing FAQ.");
                    return;
                }
            }
            console.log("Passed similarity check");
            // Update the FAQ
            await database.promisedQuery(
                `UPDATE faq SET faq = ?, uuid = ?, timestamp = ? WHERE id = ?`,
                [faq, uuid, now, id]
            );

            reply.code(200).send({ message: "FAQ updated successfully.", id });

        } catch (err) {
            console.error(err);
            sendError(reply, "Database error while editing the FAQ.");
        }
    }
} as RouteItem;
