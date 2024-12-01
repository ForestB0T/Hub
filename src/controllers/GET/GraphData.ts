import { FastifyRequest, FastifyReply } from "fastify";
import { database } from "../../structure/database/createPool.js";

export default {
    method: "GET",
    url: "/player/playtime",
    json: true,
    isPrivate: false,
    handler: async (req, reply, database: database) => {
        const { uuid, date, server } = req.query;

        if (!uuid || !date) {
            return reply.code(400).send({ success: false, message: "Missing 'uuid' or 'date' query parameter." });
        }

        const endDate = Number(date); // Current day in milliseconds (Unix timestamp).
        const startDate = endDate - 7 * 24 * 60 * 60 * 1000; // 1 week earlier.

        try {
            const query = `
                SELECT join_time, leave_time, playtime 
                FROM sessions
                WHERE uuid = ? AND join_time >= ? AND leave_time <= ? AND mc_server = ?
                ORDER BY join_time ASC
            `;
            const sessions = await database.promisedQuery(query, [uuid, startDate.toString(), endDate.toString(), server]);

            if (!sessions || sessions.length === 0) {
                return reply.code(404).send({ success: false, message: "No session data found for the given UUID and date range." });
            }

            const playtimePerDay = {};
            const msPerDay = 24 * 60 * 60 * 1000;

            for (const session of sessions) {
                const joinTime = Number(session.join_time); // Join time in milliseconds
                const leaveTime = Number(session.leave_time); // Leave time in milliseconds

                // Calculate the playtime for the session by subtracting joinTime from leaveTime
                const sessionPlaytime = leaveTime - joinTime;

                // Determine which day the session belongs to
                const day = Math.floor(joinTime / msPerDay) * msPerDay;

                // If no playtime recorded for this day yet, initialize it
                if (!playtimePerDay[day]) {
                    playtimePerDay[day] = 0;
                }

                // Add session playtime to the total for that day
                playtimePerDay[day] += sessionPlaytime;
            }

            // Format the response as an array of { day, playtime }
            const formattedData = Object.entries(playtimePerDay).map(([day, playtime]) => ({
                day: new Date(Number(day)).toISOString().split("T")[0], // Convert the timestamp to a date string (YYYY-MM-DD)
                playtime: Math.round(Number(playtime) / 60000) // Convert milliseconds to minutes
            }));

            // Send the formatted data (this could be returned in a response or used elsewhere)
            return reply.code(200).send(formattedData);

        } catch (err) {
            console.error(err);
            reply.status(500).send({ success: false, message: "Internal Server Error" });
        }
    }
};