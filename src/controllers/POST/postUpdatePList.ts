import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import api from "../../index.js";


export default {
    method: "POST", 
    url: "/updateplayerlist/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        type Users = [{
            name: string,
            ping: number
        }]

        const mc_server = req.body["mc_server"];
        const users: Users = req.body["users"];

        await api.updatePlayerList(mc_server, users);

        await reply.code(200).send({ status: "success" })
        return 

    }
} as RouteItem;