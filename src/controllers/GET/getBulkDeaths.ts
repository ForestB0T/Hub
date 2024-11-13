import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * Get total deaths count.
 * 
 * @Query uuid: string
 * @Query server: string
 * @Query limit: number
 * @Query order: string
 * @Query type: string
 */
export default {
  method: "GET",
  url: "/deaths",
  json: true,
  isPrivate: false,
  handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
    try {
      const {
        uuid,
        server,
        limit,
        order = "DESC",
        type
      } = req.query as any;

      let selectQuery = `SELECT * FROM deaths where mc_server = ? AND victimUUID = ?`

      if (type === "pvp" || type === "pve") {
        selectQuery += ` AND type = ?`
      }

      selectQuery += ` ORDER BY time ${order} LIMIT ?`;

      const queryParams = type === "all"
        ? [server, uuid, parseInt(limit)]
        : [server, uuid, type, parseInt(limit)];

      const data = await database.promisedQuery(selectQuery, queryParams);

      if (!data || data.length === 0) {
        return reply.code(404).send({ error: "No data found." });
      }

      let replyData = data

      reply.code(200).header('Content-Type', 'application/json').send(replyData);
    } catch (err) {
      console.error(err);
      reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  }
} as RouteItem;
