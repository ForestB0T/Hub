import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import api from "../../index.js";
import generateTablist from "../../util/generate/tablist/tablist.js";

/**
 * Route handler for getting a live tablist from a minecraft server.
 */
export default {
    method: "GET",
    url: "/tab/:server",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
        const server = req.params['server'];

        const playerList = api.connectedServers.get(server);
        if (!playerList) return reply.code(501).send({ Error: "server not found or is offline." })
    
        try {
            const tablist = await generateTablist(playerList.playerlist) as String;
            const formattedString = tablist.replace(/^data:image\/png;base64,/, "")
            const image = Buffer.from(formattedString, 'base64');
            return reply.code(200).header('Content-Type', 'image/png').send(image)
        } catch (err) {
            return console.error(err);
        }
    }
} as RouteItem;