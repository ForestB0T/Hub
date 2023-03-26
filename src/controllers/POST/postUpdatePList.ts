import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem, PlayerList } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import api from "../../index.js";
import Canvas from "canvas";


const headLink = "https://mc-heads.net/avatar/${name}/16";

export default {
    method: "POST", 
    url: "/updateplayerlist/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        type PlayerList = {
            name: string;
            ping: number;
            headurl?: Canvas.Image
        }

        const mc_server = req.body["mc_server"];
        const users: PlayerList[] = req.body["users"];

        await api.updatePlayerList(mc_server, users);

        await reply.code(200).send({ status: "success" })
        return 

    }
} as RouteItem;