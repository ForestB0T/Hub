import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/lastadvancements",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        const data = await database.promisedQuery(`SELECT username, advancement, time, mc_server FROM advancements ORDER BY time DESC LIMIT 20`);
        if (!data || data.length === 0) {
          return reply.code(404).send({ error: "No data found." });
        }
        const replyData = {
            users: data
        };

        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
      
    }
  } as RouteItem;
  