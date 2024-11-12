import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

/**
 * This route will get all stats from each mc_server based on a username.
 */

export default {
    method: "GET",
    url: "/user-stats/:username",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      try {
        const username = req.params["username"];
        const data = await database.promisedQuery(`
          SELECT username, kills, deaths, joindate, lastseen, uuid, playtime, joins, leaves, lastdeathTime, lastdeathString, mc_server
          FROM users
          WHERE username = ?
        `, [username]);
        if (!data || data.length === 0) {
          return reply.code(404).send({ error: "No data found." });
        }
        
        const replyData = {
          userStats: data
        };
        reply.code(200).header('Content-Type', 'application/json').send(replyData);
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  } as RouteItem;
  