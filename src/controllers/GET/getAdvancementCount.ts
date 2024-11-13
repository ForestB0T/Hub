import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * Get total advancements count.
 * 
 * @Query uuid: string
 * @Query server: string
 * 
 * 
 */
export default {
    method: "GET",
    url: "/advancements-count",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        const { 
          uuid,
          server
        } = req.query as any;

        const result = await database.promisedQuery(`
            SELECT COUNT(*) as total
            FROM advancements
            WHERE mc_server = ? AND uuid = ?
        `, [server, uuid]);

        const count = result[0]?.total || 0;

        const replyData = {
          total_advancements: count
        };

        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  } as RouteItem;
  