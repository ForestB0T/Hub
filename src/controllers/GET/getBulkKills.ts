import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * with this endpoint you can get bulk kills by username and server, with a limit and ASC or DESC type (first/last)
 *  * 
 */
export default {
  method: "GET",
  url: "/kills",
  json: true,
  isPrivate: false,
  handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
    try {

      const { uuid, server, limit, order } = req.query as { uuid: string, server: string, limit: string, order: string };

      const data = await database.promisedQuery(`
          SELECT *
          FROM deaths
          WHERE mc_server = ? AND murdererUUID = ?
          ORDER BY time ${order}
          LIMIT ${Number(limit)}
        `, [server, uuid]);

      if (!data || data.length === 0) {
        return reply.code(404).send({ error: "No data found." });
      }

      let replyData = {
        data
      }

      reply.code(200).header('Content-Type', 'application/json').send(replyData);
    } catch (err) {
      console.error(err);
      reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  }
} as RouteItem;
