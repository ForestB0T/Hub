import { database } from "../../structure/database/createPool.js";
import sendError from "../../util/functions/replyTools/sendError.js";

const durations = {
    "1_week": 7 * 24 * 60 * 60 * 1000,
    "1_month": 30 * 24 * 60 * 60 * 1000,
    "2_months": 60 * 24 * 60 * 60 * 1000,
    "3_months": 90 * 24 * 60 * 60 * 1000,
    "4_months": 120 * 24 * 60 * 60 * 1000,
    "5_months": 150 * 24 * 60 * 60 * 1000,
    "6_months": 180 * 24 * 60 * 60 * 1000,
};

export default {
    method: "GET",
    url: "/player/playtime",
    json: true,
    isPrivate: false,
    handler: async (req, reply, database: database) => {
        const { uuid, date, server, duration } = req.query;

        const dura = durations[duration];
        if (!dura) {
            sendError(reply, "Invalid duration. Valid durations are: 1_week, 1_month, 2_months, 3_months, 4_months, 5_months, 6_months.");
            return;
        }
        
        if (!uuid || !date) {
            sendError(reply, "Missing required parameters. Required parameters: uuid, date.");
            return;
        }

        const endDate = Number(date); // Current day in milliseconds (Unix timestamp).
        const startDate = endDate - dura; // 1 week earlier.

        try {
            const query = `
                SELECT join_time, leave_time, playtime 
                FROM sessions
                WHERE uuid = ? AND join_time >= ? AND leave_time <= ? AND mc_server = ?
                ORDER BY join_time ASC
            `;
            const sessions = await database.promisedQuery(query, [uuid, startDate.toString(), endDate.toString(), server]);

            if (!sessions || sessions.length === 0) {
                sendError(reply, "No playtime found for this player.");
                return;
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
            sendError(reply, "Database Error while fetching playtime.");
            return;
        }
    }
};