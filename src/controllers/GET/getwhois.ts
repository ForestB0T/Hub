import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

/**
 * Getting a users whois description
 */
export default {
    method: "GET",
    url: "/whois",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const user: string = req.query["username"];

        try {
            const res = await database.promisedQuery(
                "SELECT username, description FROM whois WHERE username=?",
                [user]
            )

            if (!res || !res.length || !res[0].description) {
                sendError(reply, "No user found with this username.");
                return;
            }

            const username = res[0].username;
            const description = res[0].description;

            const data = {
                username: username,
                description: description
            };

            reply.code(200).header("Content-Type", "application/json").send(data);

        } catch (err) {
            sendError(reply, "Database Error while fetching user stats.");
            return;
        }

    }
} as RouteItem;