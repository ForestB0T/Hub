import { FastifyRequest, FastifyReply } from 'fastify';
import database from '../../structure/database/createPool.js';
import { allStats } from '../../../types';
import generateTablist from '../../util/generate/tablist/tablist.js';
import checkPrivateKey from '../../util/security/keyAuth.js';
import { ws } from '../../index.js';
/**
 * 
 * Request livechat channels.
 * Private api key is required.
 * 
 */
export const livechatChannelHandler = (req: FastifyRequest, reply: FastifyReply) => {
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
};

/**
 * 
 * Request playtime handler. 
 *  
 */
export const playtimeHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const serv: string = req.params['server'];
    const user: string = req.params['user'];
    database.query(`SELECT playtime from users WHERE username = ? and mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].playtime) return reply.code(501).send({ Error: "user not found." })
        const data = {
            playtime: res[0].playtime
        }
        reply.code(200).header('Content-Type', 'application/json').send(data)
        return;
    })
};

/**
 * 
 * 
 * Request Kills/Deaths handler.
 *  
 */
export const kdHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const serv: string = req.params['server'];
    const user: string = req.params['user'];
    database.query(`SELECT kills,deaths from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].kills || !res[0].deaths) return reply.code(501).send({ Error: "user not found." })
        const kills: number = res[0].kills;
        const deaths: number = res[0].deaths;
        reply.code(200).header('Content-Type', 'application/json').send({
            kills: kills,
            deaths: deaths
        })
        return;
    })
}

/**
 * 
 * Query the amount of joins a user has.
 *   
 */
export const joinLeaveHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const serv: string = req.params['server'];
    const user: string = req.params['user'];
    database.query(`SELECT joins from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].joins) return reply.code(501).send({ Error: "user not found." })
        const data: string = res[0].joins
        reply.code(200).header('Content-Type', 'application/json').send({ joins: data })
        return;
    })
}


/**
 * 
 * Query when a player was lastseen
 *  
 */
export const lastseenHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const serv: string = req.params['server'];
    const user: string = req.params['user'];
    database.query(`SELECT lastseen from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].lastseen) return reply.code(501).send({ Error: "user not found." })
        const data: string = res[0].lastseen
        reply.code(200).header('Content-Type', 'application/json').send({ lastseen: data })
        return;
    })
}

/**
 * 
 * Query a users joindate.
 *  
 */
export const joindateHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const serv: string = req.params['server'];
    const user: string = req.params['user'];
    database.query(`SELECT joindate from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].joindate) return reply.code(501).send({ Error: "user not found." })
        const data: string = res[0].joindate;
        reply.code(200).header('Content-Type', 'application/json').send({ joindate: data })
        return;
    })
}

/**
 * 
 * Query all stats on a user.
 *  
 */
export const profileHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const serv: string = req.params['server'];
    const user: string = req.params['user'];
    database.query(`SELECT * from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].username) return reply.code(501).send({ Error: "user not found." })
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
            lastdeathString: i.lastdeathString,
            lastdeathTime: i.lastdeathTime,
            id: i.id
        })
        return;
    })
}

/**
 * 
 * Query the total message count of a user
 *  
 */
export const messageCountHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const user: string = req.params['user'];
    const serv: string = req.params['server'];
    database.query(`SELECT name,COUNT(name) AS cnt FROM messages WHERE name=? AND mc_server = ? HAVING cnt > 1`, [user, serv], (err, result) => {
        if (err || !result[0] || !result[0].cnt) return reply.code(501).send({ Error: "user not found." })
        const count: number = result[0].cnt;
        return reply.code(200).header('Content-Type', 'application/json').send({
            messagecount: count
        })
    })
}

/**
 * 
 * Query a live tablist of a minecraft server
 * that the bot is in.
 * 
 */
export const tabListHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const server = req.params['server'];

    const playerList = ws.playerLists.get(server);
    if (!playerList) return reply.code(501).send({ Error: "server not found." })

    try {
        const tablist = await generateTablist(playerList) as String;
        const formattedString = tablist.replace(/^data:image\/png;base64,/, "")
        const image = Buffer.from(formattedString, 'base64');
        reply.code(200).header('Content-Type', 'image/png').send(image)
        return
    } catch (err) {
        return console.error(err);
    }

}

/**
 * 
 * Query a random quote from a user.
 *  
 */
export const quoteHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const user: string = req.params['user'];
    const serv: string = req.params['server'];
    database.query(`SELECT name,message,date FROM messages WHERE name=? AND mc_server = ? AND LENGTH(message) > 30 ORDER BY RAND() LIMIT 1`, [user, serv], (err, res) => {
        if (err || !res[0] || !res[0].message || !res[0].date) return reply.code(501).send({ Error: "user not found." })
        const count = res[0].message;
        const date = res[0].date;
        return reply.code(200).header('Content-Type', 'application/json').send({
            message: count,
            date: date
        })
    })
}

/**
 * 
 * Query when a user last died. 
 * the time and the death message string.
 *  
 */
export const lastdeathHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const user: string = req.params['user'];
    const serv: string = req.params['server'];
    database.query(`SELECT lastdeathTime,lastdeathString from users WHERE username = ? AND mc_server = ?`, [user, serv], (err, res) => {
        if (err || !res[0].lastdeathTime || !res[0].lastdeathString) return reply.code(200).header('Content-Type', 'application/json').send({ error: "user not found" });
        const lastdeathString: string = res[0].lastdeathString;
        const lastdeathTime: number = res[0].lastdeathTime;
        return reply.code(200).header('Content-Type', 'application/json').send({
            death: lastdeathString,
            time: lastdeathTime
        })
    })
}

/**
 * 
 * Get top stats handler
 * 
 */
export const topStatsHandler = (req: FastifyRequest, reply: FastifyReply) => {
    const stat: string = req.params['stat'];
    const serv: string = req.params['server'];
    database.query(`SELECT username,${stat} from users WHERE mc_server = ? ORDER BY ${stat} DESC LIMIT 6`, [serv], (err, res) => {
        if (err || !res) return reply.code(501).send({ Error: "user not found." })
        reply.code(200).header('Content-Type', 'application/json').send({
            top_stat: res
        })
        return;
    })
};