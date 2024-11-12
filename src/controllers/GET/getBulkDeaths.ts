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
    url: "/deaths",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        // const username = req.params["username"];
        // const mc_server = req.params["server"];
        // const limit = req.params["limit"];
        // const type = req.params["type"]
        // const action = type === "last" ? "DESC" : "ASC"

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

        // const data = await database.promisedQuery(`
        //   SELECT *
        //   FROM deaths
        //   WHERE mc_server = ? AND victimUUID = ? AND type = ?
        //   ORDER BY time ${order}
        //   LIMIT ${limit}
        // `, [server, uuid, type]);

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
  