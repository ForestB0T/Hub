import { FastifyReply, FastifyRequest } from "fastify";
import api from "../../../../index.js";
import type { database } from "../../../../structure/database/createPool.js";

export default {
    method: "GET",
    url: "/status",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        const databaseIsConnected = await database.isConnected();
        const connectedServers = [...api.connectedServers.keys()];

        const getTotalMessageRows = await database.promisedQuery("EXPLAIN SELECT COUNT(*) FROM messages");
        const getTotalUserRows = await database.promisedQuery("EXPLAIN SELECT COUNT(*) FROM users");

        const res = {
            databaseIsConnected: databaseIsConnected,
            connectedServers: connectedServers,
            memory: `${Math.round(used * 100) / 100} MB`,
            messages: getTotalMessageRows[0].rows + 1_000_000,
            users: getTotalUserRows[0].rows
        }

        reply.code(200).header('Content-Type', 'application/json').send({
            status: res
        })
        return;

    }
}