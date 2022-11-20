import type { FastifyReply, FastifyRequest } from "fastify";
import api from "../../index.js";
import { RouteItem } from "../../../types";

export default {
    method: "GET", 
    url: "/connected-websockets",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply) => {

        let arr = [];
        for (const [key, _] of api.ws.collectedWebsockets) {
            arr.push(key);
        }
        reply.code(200).header('Content-Type', 'application/json').send({
            arr
        })
    }
} as RouteItem;