import type { Pool } from "mysql";
import util from "util";
import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../../types";
import checkPrivateKey from "../../util/security/keyAuth.js";

export default {
    method: "POST", 
    url: "/updatejoin/:key",
    json: true,
    isPrivate: true,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: Pool) => {
        if (!checkPrivateKey(req.params['key'], reply)) return;

        const promisedQuery = util.promisify(database.query).bind(database);


        const user      = req.body["user"],
              uuid      = req.body["uuid"],
              mc_server = req.body["mc_server"],
              time      = req.body["time"]
    
        const dbResults = await promisedQuery("SELECT * FROM users WHERE uuid = ? AND mc_server = ?", [uuid, mc_server]).catch(err => console.log(err));
    
        /**
         * Checking if user exists in database,
         * if not then insert them into database.
         */
        if (!dbResults.length) {
            try {
                await promisedQuery("INSERT INTO users(username, joindate, uuid, joins, mc_server) VALUES (?,?,?,?,?)", [user, time, uuid, 1, mc_server]);
                return reply.code(200).send({success: "new user added", newuser: true})
            } catch (err) {
                reply.code(200).send({ Error: "Failed to insert new user into database." });
                return
            }
        }
    
        /**
         * Checking if uuid's are the same but usernames are different.
         * if so then that means the user has changed their name so it gets updated.
         */
        if (dbResults.length > 0 && (uuid === dbResults[0].uuid && user !== dbResults[0].username)) {
            try {
                await promisedQuery("UPDATE users SET username = ? WHERE username = ? AND uuid = ? AND mc_server = ?", [user, dbResults[0].username, uuid, mc_server]);
                return reply.code(200).send({success: "username updated", oldname: dbResults[0].username});
            } catch (err) {
                reply.code(200).send({ Error: "Error while updating name for " + user});
                return
            }
    
        }
    
        /**
         * If user exits, and uuid is the same and names are the same,
         * then add +1 to their join count and update lastseen time.
         */
        if (dbResults.length > 0 && (uuid === dbResults[0].uuid && user === dbResults[0].username)) {
            try {
                await promisedQuery("UPDATE users SET joins = joins + 1, lastseen = ? WHERE username = ? AND mc_server = ?", [time, user, mc_server]);
                reply.code(200).send({ success: true })
                return
            } catch (err) {
                reply.code(200).send({ Error: "Error while updating join count for " + user})
                return
            }
        }
    }
} as RouteItem;


