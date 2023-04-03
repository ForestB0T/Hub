import { FastifyReply, FastifyRequest } from "fastify";
import { AddGuildArgs, RouteItem } from "../../..";
import checkPrivateKey from "../../util/security/keyAuth.js";
import type { database } from "../../structure/database/createPool";

export default {
    method: "POST", 
    url: "/addguild/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const {
            channel_id,
            created_at,
            guild_id,
            guild_name,
            mc_server,
            setup_by
         } = req.body as AddGuildArgs;

         console.log(req.body);

         const regex = /[^a-zA-Z0-9\s]/g;
         // Replace all unwanted characters with an empty string
         const cleanedName = guild_name.replace(regex, '');
 

         try {
            const query = `
            INSERT INTO guilds (guild_id, channel_id, mc_server, setup_by, created_at, guild_name)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE channel_id = ?, mc_server = ?, setup_by = ?, created_at = ?
        `;
            const params = [
                guild_id, channel_id, mc_server, setup_by, created_at, cleanedName, channel_id, mc_server, setup_by, Date.now()
            ]
            
            await database.promisedQuery(query,params);
            reply.code(200).send({ success: true })
            return;

         } catch (err) {
            console.error(err)
            reply.code(200).send({ Error: "Database Error while adding discord guild." });
            return;
         }
    }
} as RouteItem;