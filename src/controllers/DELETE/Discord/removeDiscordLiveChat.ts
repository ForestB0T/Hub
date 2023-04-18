import { FastifyReply, FastifyRequest } from "fastify";
import checkPrivateKey from "../../../util/security/keyAuth.js";
import type { database } from "../../../structure/database/createPool.js";
import { RemoveLiveChatArgs } from "../../../../index.js";

export default {
    method: "POST",
    url: "/removelivechat/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const { guild_id, channel_id } = req.body as RemoveLiveChatArgs

        try {
            await database.promisedQuery(
                "DELETE FROM livechats WHERE guildID = ?" + (channel_id ? " AND channelID = ?" : ""),
                channel_id ? [guild_id, channel_id] : [guild_id]
            );
            reply.code(200).send({ success: true })

            return;
        } catch (err) {
            console.error(`Error occurred while trying to add livechat for guild ID ${guild_id}:`, err);
            reply.code(200).send({ Error: "Database Error while removing discord guild." });
            return
        }

    }
}
