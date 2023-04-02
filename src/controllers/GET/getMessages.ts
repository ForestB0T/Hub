import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

interface MessageRow {
  name: string;
  message: string;
  date: string;
  mc_server: string;
}

export default {
  method: "GET",
  url: "/messages/:username/:server/:limit/:type",
  json: true,
  isPrivate: false,
  handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
    try {
      const username = req.params["username"];
      const mc_server = req.params["server"];
      const limit = Number(req.params["limit"]);
      const type = req.params["type"]
      const action = type === "last" || type === "DESC".toLowerCase() || type === "DESC" ? "DESC" : "ASC"

      const data = await database.promisedQuery(`
        SELECT name,message,date,mc_server
        FROM messages
        WHERE mc_server = ? AND name = ?
        ORDER BY date ${action}
        LIMIT ${limit}, 20;
      `, [mc_server, username]);

      if (!data || data.length === 0) {
        return reply.code(404).send({ error: "No data found." });
      }

      const replyData = {
        messages: data as MessageRow[],
        count: data.length,
        action: action
      };

      reply.code(200).header('Content-Type', 'application/json').send({
        success: true,
        data: replyData
      });
    } catch (err) {
      console.error(err);
      reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  }
} as RouteItem;
