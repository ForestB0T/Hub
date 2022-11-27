import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import api from "../../index.js";
import generateTablist from "../../util/generate/tablist/tablist.js";


export default {
    method: "GET",
    url: "/tab/:server",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
        const server = req.params['server'];

        const playerList = api.playerLists.get(server);
        if (!playerList) return reply.code(501).send({ Error: "server not found." })
    
        try {
            const tablist = await generateTablist(playerList) as String;
            const formattedString = tablist.replace(/^data:image\/png;base64,/, "")
            const image = Buffer.from(formattedString, 'base64');
            return reply.code(200).header('Content-Type', 'image/png').send(image)
        } catch (err) {
            return console.error(err);
        }
    }
} as RouteItem;