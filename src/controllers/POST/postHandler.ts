import type { FastifyRequest, FastifyReply } from "fastify";
import checkPrivateKey from "../../util/security/keyAuth.js";
import database, { promisedQuery } from "../../structure/database/createPool.js";

const successMessage = (reply: FastifyReply) => reply.code(200).send({ success: true })
const errorMessage = (reply: FastifyReply, err: string) => reply.code(200).send({ Error: err });

/**
 * 
 * Update Leaves
 * 
 */
export const updateUserLeaves = async (req: FastifyRequest, reply: FastifyReply) => { 
    if (!checkPrivateKey(req.params['key'], reply)) return;

    const user      = req.body["user"], 
          mc_server = req.body["mc_server"], 
          time      = req.body["time"];

    try {
        await promisedQuery("UPDATE users SET leaves = leaves + 1, lastseen = ? WHERE username = ? AND mc_server = ?", [time, user, mc_server]);
        return successMessage(reply);
    } catch (err) {
        return errorMessage(reply, "Database Error while updating user leave.");
    }
}   

/**
 * 
 * Saving user joins
 * 
 */
export const saveUserJoins = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!checkPrivateKey(req.params['key'], reply)) return;

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
            return errorMessage(reply, "Failed to insert new user into database.");
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
            return errorMessage(reply, "Error while updating name for " + user);
        }

    }

    /**
     * If user exits, and uuid is the same and names are the same,
     * then add +1 to their join count and update lastseen time.
     */
    if (dbResults.length > 0 && (uuid === dbResults[0].uuid && user === dbResults[0].username)) {
        try {
            await promisedQuery("UPDATE users SET joins = joins + 1, lastseen = ? WHERE username = ? AND mc_server = ?", [time, user, mc_server]);
            return successMessage(reply);
        } catch (err) {
            return errorMessage(reply, "Error while updating join count for " + user);
        }
    }

};


/**
 * 
 * Saving user pvp kills
 * 
 */
export const savePvpKill = (req: FastifyRequest, reply: FastifyReply) => {
    if (!checkPrivateKey(req.params['key'], reply)) return;

    const victim  = req.body['victim'],
        murderer  = req.body['murderer'],
        deathmsg  = req.body['deathmsg'],
        mc_server = req.body['mc_server'];

    database.query(
        `
        UPDATE users SET deaths = deaths + 1, lastdeathString = ?, lastdeathTime = ? WHERE username = ? AND mc_server = ?;
        UPDATE users SET kills = kills + 1 WHERE username = ? AND mc_server = ?
        `,
        [deathmsg, Date.now(), victim, mc_server, murderer, mc_server],
        (err, res) => {
            if (err) {
                reply.code(501).send({ Error: "error with database." });
                return;
            }
            return successMessage(reply);
        }
    )


}


/**
 * 
 * Saving user pve kills
 * 
 */
export const savePveKill = (req: FastifyRequest, reply: FastifyReply) => {
    if (!checkPrivateKey(req.params['key'], reply)) return;

    const user    = req.body['victim'],
        deathmsg  = req.body["deathmsg"],
        mc_server = req.body["mc_server"];

    database.query(
        "UPDATE users SET deaths = deaths + 1, lastdeathString = ?, lastdeathTime = ? WHERE username = ? AND mc_server = ?",
        [deathmsg, Date.now(), user, mc_server],
        (err, res) => {
            if (err) {
                reply.code(501).send({ Error: "error with database." });
                return;
            }
            return successMessage(reply);
        }
    )

}

/**
 * 
 * Saving user playtime.
 * 
 */
export const savePlaytime = (req: FastifyRequest, reply: FastifyReply) => {
    if (!checkPrivateKey(req.params['key'], reply)) return;

    const user    = req.body["user"],
        mc_server = req.body["mc_server"],
        time      = req.body["time"];

    database.query(
        "UPDATE users SET playtime = playtime + ? WHERE username = ? and mc_server = ?",
        [time, user, mc_server],
        (err, res) => {
            if (err) {
                reply.code(501).send({ Error: "error with database." });
                return;
            }
            return successMessage(reply);
        }
    )

};

/**
 * 
 * Saving messages from a bot.
 * Private key required.
 * 
 */
export const saveChatMessages = (req: FastifyRequest, reply: FastifyReply) => {
    if (!checkPrivateKey(req.params['key'], reply)) return;

    const msg = req.body["message"],
        user = req.body["user"],
        mc_server = req.body["mc_server"];

    database.query(
        `INSERT INTO messages (name, message, date, mc_server) VALUES (?, ?, ?, ?)`,
        [user, msg, Date.now(), mc_server],
        (err, res) => {
            if (err) {
                console.error(err);
                reply.code(501).send({ Error: "error with database." });
                return;
            }
            return successMessage(reply);
        });

}