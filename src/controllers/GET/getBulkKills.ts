import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * with this endpoint you can get bulk kills by username and server, with a limit and ASC or DESC type (first/last)
 * example: https://api.forestbot.org/kills/notFebzey/simplyvanilla/10/last
 * 
 */
export default {
    method: "GET",
    url: "/kills/:username/:server/:limit/:type",
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
          FROM deaths
          WHERE mc_server = ? AND murderer = ?
          ORDER BY time ${action}
          LIMIT ${limit}
        `, [mc_server, username]);

        if (!data || data.length === 0) {
          return reply.code(404).send({ error: "No data found." });
        }

        let replyData = {
            killmsgs: data
        }


        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  } as RouteItem;
  