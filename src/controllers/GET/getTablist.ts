import { FastifyReply, FastifyRequest } from "fastify";
import { PlayerList, RouteItem } from "../../..";
import api from "../../index.js";
import generateTablist from "../../util/generate/tablist/tablist.js";
import sendError from "../../util/functions/replyTools/sendError.js";
// const fakePlayers: PlayerList[] = [
//     { username: 'Player1', uuid: 'uuid-1', latency: 745, server: 'Server1' },
//     { username: 'Player2', uuid: 'uuid-2', latency: 248, server: 'Server2' },
//     { username: 'Player3', uuid: 'uuid-3', latency: 216, server: 'Server3' },
//     { username: 'Player4', uuid: 'uuid-4', latency: 543, server: 'Server4' },
//     { username: 'Player5', uuid: 'uuid-5', latency: 662, server: 'Server5' },
// ];
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

     //   const playerList = { playerlist: fakePlayers}
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