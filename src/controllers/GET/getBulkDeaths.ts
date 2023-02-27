import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * With this endpoint you can get kills or deaths 
 * specified by username, mc_server, limit, type (first or last msgs) and type of deaths (pvp or pve)
 * example: https://api.forestbot.org/deaths/notFebzey/simplyvanilla/10/last
 * 
 */
export default {
    method: "GET",
    url: "/deaths/:username/:server/:limit/:type",
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
          WHERE mc_server = ? AND victim = ?
          ORDER BY time ${action}
          LIMIT ${limit}
        `, [mc_server, username]);

        if (!data || data.length === 0) {
          return reply.code(404).send({ error: "No data found." });
        }

        let replyData = {
            deathmsgs: data
        }


        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  } as RouteItem;
  