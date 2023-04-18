import { FastifyReply, FastifyRequest } from "fastify";
import { DiscordForestBotLiveChat, RouteItem } from "../../../..";
import type { database } from "../../../structure/database/createPool";

export default {
    method: "GET", 
    url: "/getchannels",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        try {
            const res = await database.promisedQuery("SELECT * FROM livechats")
            if (!res || !res.length) throw new Error("Failed to get livechats.");

            const channels = res as DiscordForestBotLiveChat[];
            if (!channels || channels.length <= 0) throw new Error();

            reply.code(200).header("Content-Type", "application/json").send({
                success: true,
                data: channels
            });

        } catch (err) {
            reply.code(201).send({ success: false, error: "error with database." });
            return;
        }

    }
} as RouteItem;