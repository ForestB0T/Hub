import { FastifyReply } from "fastify";
import { database } from "../../../structure/database/createPool.js";
import sendError from "../../../util/functions/replyTools/sendError.js";

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
    url: "/server/playercounts",
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

        const endDate = Number(date);       // Current day in ms (unix ms timestamp)
        const startDate = endDate - dura;   // Range start

        try {
            const query = `
                SELECT 
                    timestamp,
                    count
                FROM 
                    server_player_counts
                WHERE 
                    mc_server = ?
                    AND timestamp BETWEEN ? AND ?
                ORDER BY timestamp ASC;
            `;
            const rows = await database.promisedQuery(query, [server, startDate, endDate]);

            // Bucket counts per day
            const countsPerDay: { [key: string]: { total: number, samples: number } } = {};
            const msPerDay = 24 * 60 * 60 * 1000;

            for (const row of rows) {
                const day = new Date(Number(row.timestamp)).toISOString().split("T")[0];

                if (!countsPerDay[day]) {
                    countsPerDay[day] = { total: 0, samples: 0 };
                }

                countsPerDay[day].total += Number(row.count);
                countsPerDay[day].samples += 1;
            }

            // Fill empty days with zero
            for (let ts = startDate; ts <= endDate; ts += msPerDay) {
                const day = new Date(ts).toISOString().split("T")[0];
                if (!countsPerDay[day]) {
                    countsPerDay[day] = { total: 0, samples: 0 };
                }
            }

            // Format response (average player count per day)
            const formattedData = Object.entries(countsPerDay).map(([day, { total, samples }]) => ({
                day,
                avgPlayerCount: samples > 0 ? Math.round(total / samples) : 0
            }));

            return reply.code(200).send(formattedData);
        } catch (err) {
            console.error(err);
            sendError(reply, "Database Error while fetching player counts.");
            return;
        }
    }
};
