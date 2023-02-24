import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import { database } from "../../structure/database/createPool";


export default {
    method: "GET",
    url: "/mcvpg-math/:username",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
      const username: string = req.params["username"];
      try {
        const stats = await database.promisedQuery(`SELECT solved_count, wrong_count FROM mcvpgmath WHERE username = ?`, [username]);
        console.log(stats)
        if (stats.length === 0) return reply.code(404).send({ Error: "User not found. "});
        const { solved_count, wrong_count } = stats[0];

        reply.code(200).header('Content-Type', 'application/json').send({
          username,
          solved_count,
          wrong_count
        });
      } catch (err) {
        console.error(err);
        reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
  
      return;
    }
  } as RouteItem;
  