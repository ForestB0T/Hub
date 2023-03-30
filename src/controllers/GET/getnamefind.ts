import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/namefind/:user",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const user: string = req.params["user"];
        const mc_server: string = req.params["mc_server"]

        try {
            const res = await database.promisedQuery(
                `
                  SELECT username FROM users
                  WHERE username LIKE ? AND mc_server = ?
                  ORDER BY ABS(CHAR_LENGTH(username) - CHAR_LENGTH(?)), lastseen DESC
                  LIMIT 6;
                `,
                [`%${user}%`, mc_server, user]
              );

            if (!res || !res.length) throw new Error("No results.")

            const usernames = [...new Set(res.map(row => row.username))];

            reply.code(200).header("Content-Type", "application/json").send({usernames: usernames });

        } catch (err) {
            console.error(err);
            reply.code(200).send({ Error: "Error retrieving from database." })
            return;
        }

    }
} as RouteItem;