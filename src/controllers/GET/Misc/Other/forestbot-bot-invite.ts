import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../../..";

export default {
    method: 'GET',
    url: '/invite',
    json: false,
    handler: (req: FastifyRequest, reply: FastifyReply) => reply.redirect("https://discord.com/api/oauth2/authorize?client_id=771280674602614825&permissions=2048&scope=bot%20applications.commands")
} as RouteItem;