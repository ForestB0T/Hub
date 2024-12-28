import type { FastifyReply } from "fastify";

export default function sendError(reply: FastifyReply, errorMessage: string, code = 400) {
    reply.code(400).send({ error: errorMessage });
}