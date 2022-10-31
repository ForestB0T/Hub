import { FastifyReply, FastifyRequest } from 'fastify';
import { RouteItem } from '../../types.js';
import * as getHandlers from '../controllers/GET/getRequests.js';
import * as postHandlers from "../controllers/POST/postHandler.js";

/**
 * @POST_Requests
 * savechat
 * saveplaytime
 * savepvekill
 * savepvpkill
 * updatejoin
 * updateleave
 * 
 * 
 * @GET_Requests
 * getchannels
 * playtime
 * joindate
 * joins
 * kd
 * lastdeath
 * lastMessage
 * lastseen
 * messagecount
 * user
 * tab
 * quote
 *  
 */

const Routes: Array<RouteItem> = [
    {
        method: "POST", 
        url: "/updateleave/:key",
        json: true, 
        handler: postHandlers.updateUserLeaves,
        isPrivate: true
    },
    {
        method: "POST", 
        url: "/updatejoin/:key",
        json: true, 
        handler: postHandlers.saveUserJoins,
        isPrivate: true
    },
    {
        method: "POST", 
        url: "/savepvpkill/:key",
        json: true, 
        handler: postHandlers.savePvpKill,
        isPrivate: true
    },
    {
        method: "POST", 
        url: "/savepvekill/:key",
        json: true, 
        handler: postHandlers.savePveKill,
        isPrivate: true
    },
    {
        method: "POST",
        url: "/saveplaytime/:key",
        json: true,
        handler: postHandlers.savePlaytime,
        isPrivate: true
    },
    {
        method: "POST", 
        url: '/savechat/:key',
        json: true,
        handler: postHandlers.saveChatMessages,
        isPrivate: true
    },
    {
        method: 'GET', 
        url: '/getchannels/:server/:key',
        json: true, 
        handler: getHandlers.livechatChannelHandler,
        isPrivate: true
    },
    {
        method: 'GET',
        url: '/playtime/:user/:server',
        json: true,
        handler: getHandlers.playtimeHandler,
    }, 
    {
        method: 'GET',
        url: '/kd/:user/:server',
        json: true,
        handler: getHandlers.kdHandler
    },
    {
        method: 'GET',
        url: '/joins/:user/:server',
        json: true,
        handler: getHandlers.joinLeaveHandler
    },
    {
        method: 'GET',
        url: '/lastseen/:user/:server',
        json: true,
        handler: getHandlers.lastseenHandler
    },
    {
        method: "GET", 
        url: "/lastmessage/:user/:server",
        json: true, 
        handler: getHandlers.lastMessageHandler,
        isPrivate: true
    },
    {
        method: 'GET',
        url: '/joindate/:user/:server',
        json: true,
        handler: getHandlers.joindateHandler
    },
    {
        method: 'GET',
        url: '/user/:user/:server',
        json: true,
        handler: getHandlers.profileHandler
    },
    {
        method: 'GET',
        url: '/tab/:server',
        json: true,
        handler: getHandlers.tabListHandler
    },
    {
        method: 'GET',
        url: '/messagecount/:user/:server',
        json: true,
        handler: getHandlers.messageCountHandler
    },
    {
        method: 'GET',
        url: '/quote/:user/:server',
        json: true,
        handler: getHandlers.quoteHandler
    },
    {
        method: 'GET',
        url: '/lastdeath/:user/:server',
        json: true,
        handler: getHandlers.lastdeathHandler
    },
    {
        method: "GET",
        url: '/topstat/:stat/:server',
        json: true,
        handler: getHandlers.topStatsHandler
    },
    {
        method: 'GET',
        url: '/invite',
        json: false,
        handler: (req: FastifyRequest, reply: FastifyReply) => reply.redirect("https://discord.com/api/oauth2/authorize?client_id=771280674602614825&permissions=2048&scope=bot%20applications.commands")
    },
];

export default Routes;