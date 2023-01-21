import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";

export default {
    method: 'GET',
    url: '/discord',
    json: false,
    handler: (req: FastifyRequest, reply: FastifyReply) => reply.redirect("https://discord.gg/7Wb3PQQ2dX")
} as RouteItem;