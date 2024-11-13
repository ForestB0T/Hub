import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import ForestApi from "../../structure/Api/ForestApi";

/**
 * This endpoint takes in a username and will check the 
 * connected servers map to see if the user is online in any of the servers.
 */
export default {
    method: "GET",
    url: "/online",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database, api: ForestApi) => {

        const user: string = req.query['username'];

        const { connectedServers } = api;
        let isUserOnline = false;

        connectedServers.forEach((val, key) => {
            const { playerlist } = val;
            const isPlayerFound = playerlist.some(player => player.username === user);
            if (isPlayerFound) {
                isUserOnline = true;
                reply.send({
                    online: true,
                    server: key
                });
            }
        });

        if (!isUserOnline) {
            reply.send({
                isOnline: false
            });
        }
    }
} as RouteItem;
