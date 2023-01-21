import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        return reply.redirect("https://forestbot.org");
    }
} as RouteItem;