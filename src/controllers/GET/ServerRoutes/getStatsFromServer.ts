import { FastifyReply, FastifyRequest } from "fastify";
import { allStats, RouteItem } from "../../../..";
import type { database } from "../../../structure/database/createPool";
import sendError from "../../../util/functions/replyTools/sendError.js";

/**
 * Route handler for getting all user statistics from a UUID and a minecraft server.
 */
export default {
    method: "GET",
    url: "/user",
    json: true,
    isPrivate: false,
    handler: (req: FastifyRequest, reply: FastifyReply, database: database) => {
        const { server, uuid} = req.query as { server: string, uuid: string};
        
        database.Pool.query(`SELECT * from users WHERE uuid = ? AND mc_server = ?`, [uuid, server], (err, res) => {
            if (err || !res[0] || !res[0].username){
                sendError(reply, "No user found.");
                return;
            }
            const i: allStats = res[0];
            reply.code(200).header('Content-Type', 'application/json').send({
                username: i.username,
                kills: i.kills,
                deaths: i.deaths,
                joindate: i.joindate,
                lastseen: i.lastseen,
                uuid: i.uuid,
                playtime: i.playtime,
                joins: i.joins,
                leaves: i.joins,
                lastdeathTime: i.lastdeathTime,
                lastdeathString: i.lastdeathString,
                mc_server: server
            })
            return;
        })
    }
} as RouteItem;