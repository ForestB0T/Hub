import { FastifyReply, FastifyRequest } from "fastify";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";
import { RemoveGuildArgs } from "../../../index.js";

export default {
    method: "POST",
    url: "/removeguild/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const { guild_id } = req.body as RemoveGuildArgs

        try {
            await database.promisedQuery("DELETE FROM guilds WHERE guild_id = ?", [guild_id]);
            reply.code(200).send({ success: true })
            return;
        } catch (err) {
            console.error(err, "Error removing discord guild.");
            reply.code(200).send({ Error: "Database Error while removing discord guild." });
            return
        }

    }
}
