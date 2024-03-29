import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import type { SocketStream } from "@fastify/websocket";

let cachedMessages = [];
let lastInsertTime = Date.now();


/**
 * Deprecated
 */
export default {
    method: "GET",
    url: "/savechat",
    json: true,
    isPrivate: true,
    useWebsocket: true,
    handler: async (connection: SocketStream, rep, database: database) => {
        if (rep.headers["x-api-key"] !== process.env.APIKEY) {
            connection.socket.send(JSON.stringify({ success: false, reason: "Invalid key" }))
            return connection.socket.close();
        }

        connection.socket.on('message', async message => {
            try {
                const data = JSON.parse(message.toString());
                if (data.close) return connection.socket.close();
                if (!data.username || !data.message || !data.mc_server) return;

                if (data.message.length > 250) {
                    data.message = data.message.substring(0, 249) + '...';
                  }

                cachedMessages.push([data.username, data.message, Date.now(), data.mc_server]);

                const now = Date.now();
                if (cachedMessages.length >= 50 || now - lastInsertTime >= 30000) {
                    await database.promisedQuery(
                        "INSERT INTO messages (name, message, date, mc_server) VALUES ?",
                        [cachedMessages]
                    ).catch(()=>{});
                    cachedMessages = [];
                    lastInsertTime = now;
                }

                connection.socket.send(JSON.stringify({ success: true }));
                return;

            } catch (error) {
                console.error(error);
                connection.socket.send(JSON.stringify({ success: false, error: error.message }));
                return;
            }
        });
    }
} as RouteItem;
