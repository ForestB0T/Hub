import { FastifyReply } from "fastify";
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
    url: "/server/playtime",
    json: true,
    isPrivate: false,
    handler: async (req, reply: FastifyReply, database: database) => {
        const { date, server, duration } = req.query;

        const dura = durations[duration];
        if (!dura) {
            sendError(reply, "Invalid duration. Valid durations are: 1_week, 1_month, 2_months, 3_months, 4_months, 5_months, 6_months.");
            return;
        }

        if (!date || !server) {
            sendError(reply, "Missing required parameters. Required parameters: date and server");
            return;
        }

        const endDate = Number(date); // Current day in milliseconds (Unix timestamp).
        const startDate = endDate - dura; // Start of the range.

        try {
            const query = `
                SELECT 
                    join_time,
                    leave_time,
                    GREATEST(join_time, ?) AS adjusted_join_time,
                    LEAST(leave_time, ?) AS adjusted_leave_time
                FROM 
                    sessions
                WHERE 
                    mc_server = ?
                    AND join_time <= ?
                    AND leave_time >= ?;
            `;
            const sessions = await database.promisedQuery(query, [startDate, endDate, server, endDate, startDate]);

            // Initialize playtime per day
            const playtimePerDay: { [key: string]: number } = {};
            const msPerDay = 24 * 60 * 60 * 1000;

            // Fill days with zero playtime
            for (let ts = startDate; ts <= endDate; ts += msPerDay) {
                const day = new Date(ts).toISOString().split("T")[0];
                playtimePerDay[day] = 0;
            }

            // Aggregate playtime
            for (const session of sessions) {
                const joinTime = Number(session.adjusted_join_time);
                const leaveTime = Number(session.adjusted_leave_time);

                let currentDayStart = Math.floor(joinTime / msPerDay) * msPerDay;
                while (currentDayStart < leaveTime) {
                    const nextDayStart = currentDayStart + msPerDay;
                    const day = new Date(currentDayStart).toISOString().split("T")[0];

                    const playtime = Math.min(leaveTime, nextDayStart) - Math.max(joinTime, currentDayStart);
                    playtimePerDay[day] += playtime;

                    currentDayStart = nextDayStart;
                }
            }

            // Format the data
            const formattedData = Object.entries(playtimePerDay).map(([day, playtime]) => ({
                day,
                playtime: Math.round(playtime / 60000), // Convert milliseconds to minutes
            }));

            return reply.code(200).send(formattedData);
        } catch (err) {
            console.error(err);
            sendError(reply, "Database Error while fetching playtime.");
            return;
        }
    }
};
