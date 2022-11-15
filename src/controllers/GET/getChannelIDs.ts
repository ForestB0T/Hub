import type { Pool } from "mysql";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";

export default {
    method: "GET", 
    url: "/getchannels/:server/:key",
    json: true,
    isPrivate: true,
    handler: (req: FastifyRequest, reply: FastifyReply, database: Pool) => {

        const serv: string = req.params['server'];
        if (!checkPrivateKey(req.params['key'], reply)) return;
    
        database.query(`SELECT channelID FROM livechats WHERE mc_server = ?`, [serv], (err, res) => {
            if (err) {
                reply.code(501).send({ Error: "error with database." });
                return;
            }
            const channelIds = [];
            for (const chan of res) {
                channelIds.push(chan.channelID);
            };
            reply.code(200).header('Content-Type', 'application/json').send(channelIds)
            return;
        })
    }
} as RouteItem;