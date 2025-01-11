import { FastifyReply, FastifyRequest } from "fastify";
import { PlayerList, RouteItem } from "../../..";
import api from "../../index.js";
import generateTablist from "../../util/generate/tablist/tablist.js";
import sendError from "../../util/functions/replyTools/sendError.js";

export default {
    method: "GET",
    url: "/tab/:server",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
        const server = req.params['server'];

      //  const playerList = { playerlist: fakePlayers}
        const playerList = api.connectedServers.get(server);
        if (!playerList) {
            sendError(reply, "Server not found.");
            return;
        }
    
        try {
            const tablist = await generateTablist(playerList.playerlist) as String;
            const formattedString = tablist.replace(/^data:image\/png;base64,/, "")
            const image = Buffer.from(formattedString, 'base64');
            return reply.code(200).header('Content-Type', 'image/png').send(image)
        } catch (err) {
            sendError(reply, "Error while generating tablist.");
            return; 
        }
    }
} as RouteItem;