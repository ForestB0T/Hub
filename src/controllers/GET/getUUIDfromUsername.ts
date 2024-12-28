
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

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
                sendError(reply, "No user found with this username.");
                return;
            }
            const replyData = {
                uuid: data[0].uuid
            };
            reply.code(200).header('Content-Type', 'application/json').send(replyData);
        } catch (err) {
            sendError(reply, "Database Error while fetching user stats.");
            return;
        }
    }
} as RouteItem;
