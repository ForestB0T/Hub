import { FastifyReply, FastifyRequest } from "fastify";
import { MinecraftChatMessage, RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * Route handler for fetching Minecraft chat messages.
 */
export default {
  method: "GET",
  url: "/messages",
  json: true,
  isPrivate: false,
  handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
    try {

      const { name, server, limit, order } = req.query as { name: string, server: string, limit: string, order: string };
      const data = await database.promisedQuery(`
        SELECT name,message,date,mc_server
        FROM messages
        WHERE mc_server = ? AND name = ?
        ORDER BY date ${order}
        LIMIT ${limit};
      `, [server, name]);

      if (!data || data.length === 0) {
        return reply.code(404).send({ error: "No data found." });
      }

      const replyData: MinecraftChatMessage[] = data.map((row: any) => ({
        name: row.name,
        message: row.message,
        date: row.date,
        mc_server: row.mc_server,
        uuid: row.uuid
      }));


      reply.code(200).header('Content-Type', 'application/json').send(replyData);
    } catch (err) {
      console.error(err);
      reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  }
} as RouteItem;
