import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../../..";
import type { database } from "../../../../structure/database/createPool";

export default {
    method: 'GET',
    url: '/ping',
    json: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const databaseIsConnected = await database.isConnected();

        if (!databaseIsConnected) { 
            reply.status(400).send({ status: "error", message: "database not connected" });
        } else {
            reply.status(200).send({ status: "ok" });
        }
    }
} as RouteItem;