import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * With this endpoint you can get kills or deaths 
 * specified by username, mc_server, limit, type (first or last msgs) and type of deaths (pvp or pve)
 * example: https://api.forestbot.org/deathsorkills/notFebzey/simplyvanilla/pve/10/last
 * 
 */
export default {
    method: "GET",
    url: "/deathsorkills/:username/:server/:pvporpve/:limit/:type",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        const username = req.params["username"];
        const mc_server = req.params["server"];
        const limit = req.params["limit"];
        const type = req.params["type"]
        const action = type === "last" ? "DESC" : "ASC"
        const pvporpve = req.params["pvporpve"] === "pve" ? "pve" : "pvp";

        const data = await database.promisedQuery(`
          SELECT *
          FROM deaths
          WHERE mc_server = ? AND victim = ? AND type = ?
          ORDER BY time ${action}
          LIMIT ${limit}
        `, [mc_server, username, pvporpve]);

        if (!data || data.length === 0) {
          return reply.code(404).send({ error: "No data found." });
        }

        let replyData = pvporpve === "pve" 
        ? { pve: data }
        : { pvp: data}


        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  } as RouteItem;
  