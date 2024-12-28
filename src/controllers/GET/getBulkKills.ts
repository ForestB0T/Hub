import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

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
        sendError(reply, "No kills found for this user.");
        return
      }

      let replyData = {
        data
      }

      reply.code(200).header('Content-Type', 'application/json').send(replyData);
    } catch (err) {
      sendError(reply, "Database Error while fetching kills.");
      return
    }
  }
} as RouteItem;
