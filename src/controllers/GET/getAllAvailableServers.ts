import { FastifyReply, FastifyRequest } from "fastify";
import { database } from "../../structure/database/createPool.js";
import sendError from "../../util/functions/replyTools/sendError.js";


export default {
    method: "GET",
    url: "/all-servers",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        try {
            const query = "SELECT DISTINCT mc_server FROM users WHERE mc_server IS NOT NULL AND LENGTH(mc_server) > 0";
            const data = await database.promisedQuery(query);
            if (!data || data.length === 0) {
                sendError(reply, "No servers found.");  
                return;
            }

            const servers = data.map((row: { mc_server: string }) => row.mc_server);

            return reply.code(200).send(servers);
        
        } catch (err) {
            sendError(reply, "Database Error while fetching servers.");
            return;
        }

    }
}