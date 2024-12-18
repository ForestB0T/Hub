import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * Get advancements for a user.
 * 
 * @Query uuid: string
 * @Query server: string
 * @Query limit: number
 * @Query order: string
 * 
 */
export default {
    method: "GET",
    url: "/advancements",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        const { 
          uuid,
          server, 
          limit,
          order
        } = req.query as any;

        const data = await database.promisedQuery(`
          SELECT *
          FROM advancements
          WHERE mc_server = ? AND uuid = ?
          ORDER BY time ${order}
          LIMIT ${limit}
        `, [server, uuid]);

        if (!data || data.length === 0) {
          return reply.code(404).send({ error: "No data found." });
        }

        const replyData = {
          advancements: data
        };

        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  } as RouteItem;
  