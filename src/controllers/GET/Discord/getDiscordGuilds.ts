import { FastifyReply, FastifyRequest } from "fastify";
import { DiscordGuild, RouteItem } from "../../../..";
import type { database } from "../../../structure/database/createPool";

export default {
    method: "GET",
    url: "/getguilds",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        try {
            const res = await database.promisedQuery(
                "SELECT * FROM guilds",
            );

            if (!res || !res.length) throw new Error("No results.");
            
            const guilds: DiscordGuild[] = res;
            
            reply.code(200).header("Content-Type", "application/json").send({
                success: true,
                data: guilds
            });

        } catch (err) {
            console.error(err);
            reply.code(200).send({ error: "Error retrieving from database."});
            return;
        }

    }
} as RouteItem;