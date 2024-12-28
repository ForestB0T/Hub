import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import sendError from "../../util/functions/replyTools/sendError.js";

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
          sendError(reply, "No advancements found for this user.");
          return
        }

        const replyData = {
          advancements: data
        };

        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        sendError(reply, "Database Error while fetching advancements.");
        return;
      }
    }
  } as RouteItem;
  