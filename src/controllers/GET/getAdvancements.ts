import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * This endpoint will allow for the most recent or first advancements a user has got
 * you can pick the server name, the limit of advancements and the type (last || first)
 */

export default {
    method: "GET",
    url: "/advancements/:username/:server/:limit/:type",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        const username = req.params["username"];
        const mc_server = req.params["server"];
        const limit = req.params["limit"];
        const type = req.params["type"]
        const action = type === "last" ? "DESC" : "ASC" 

        const data = await database.promisedQuery(`
          SELECT *
          FROM advancements
          WHERE mc_server = ? AND username = ?
          ORDER BY time ${action}
          LIMIT ${limit}
        `, [mc_server, username]);

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
  