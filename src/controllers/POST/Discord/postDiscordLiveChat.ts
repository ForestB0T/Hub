import { FastifyReply, FastifyRequest } from "fastify";
import { AddLiveChatArgs, RouteItem } from "../../../..";
import checkPrivateKey from "../../../util/security/keyAuth.js";
import type { database } from "../../../structure/database/createPool";

export default {
    method: "POST",
    url: "/addlivechat/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const {
            guildName,
            guildID,
            channelID,
            setupBy,
            date,
            mc_server,
        } = req.body as AddLiveChatArgs;

        console.log(req.body)

        const regex = /[^a-zA-Z0-9\s]/g;
        // Replace all unwanted characters with an empty string
        const cleanedName = guildName.replace(regex, '');

        try {
            await database.promisedQuery(`
            INSERT INTO livechats (guildName, guildID, channelID, setupBy, date, mc_server)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            guildName = VALUES(guildName),
            setupBy = VALUES(setupBy),
            date = VALUES(date),
            mc_server = VALUES(mc_server);
        `, [cleanedName, guildID, channelID, setupBy, date, mc_server]);

            reply.code(200).send({ success: true })
            return;

        } catch (err) {
            console.error(err)
            reply.code(200).send({ Error: "Database Error while adding discord guild livechat." });
            return;
        }
    }
} as RouteItem;