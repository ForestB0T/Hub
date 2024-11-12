import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";

export default {
    method: "GET",
    url: "/whois",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const user: string = req.query["username"];

        try {
            const res = await database.promisedQuery(
                "SELECT username, description FROM whois WHERE username=?",
                [user]
            )

            if (!res || !res.length || !res[0].description) throw new Error("No results.")

            const username = res[0].username;
            const description = res[0].description;
            
            const data = {
                username: username,
                description: description
            };
            
            reply.code(200).header("Content-Type", "application/json").send(data);

        } catch (err) {
            console.error(err);
            reply.code(200).send({ Error: "Error retrieving from database."})
            return;
        }

    }
} as RouteItem;