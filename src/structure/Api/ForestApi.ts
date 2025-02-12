import type { PlayerList, RouteItem, Sessions } from '../../../index.js';
import Fastify, { FastifyInstance, RouteOptions } from 'fastify';
import websocket, { WebSocket } from "@fastify/websocket";
import cors from '@fastify/cors';
import fs from "fs/promises";
import Database from '../database/createPool.js';
import cron from "node-cron";
import Canvas from "canvas";
import Logger from '../logger/Logger.js';
import fetchAvatar from '../../util/fetchAvatar.js';
import path from 'path';
import InsertPlayerPlaytime from '../database/functions/INSERT/savePlayerPlaytime.js';
import InsertServerPlayerCount from '../database/functions/INSERT/InsertServerPlayerCount.js';

/**
 * Main Class for ForestBOT Data API.
 */
export default class ForestApi {
    public server: FastifyInstance;
    public database: Database;
    public connectedServers: Map<string, { playerlist: PlayerList[], timestamp: number }> = new Map();
    public playerSessions = new Map<string, Sessions[]>();

    constructor(private port: number) {
        this.server = Fastify();
        this.server.setNotFoundHandler(async (request, reply) => await reply.code(404).type('text/html').send('Route not found.'));
        this.database = new Database();

        /**
         * Checking connected servers every 2 minutes. (mc bots)
         */
        cron.schedule('*/2 * * * *', () => {
            this.checkConnectedServers();
        });

        //create a timer or cron that runs every 1 hour to insert the player count for each server
        cron.schedule('0 * * * *', async () => {
            for (const [server, data] of this.connectedServers) {
                if (!server || !data) return;
                const count = data.playerlist.length;
                await InsertServerPlayerCount(count, server);
            }
        });
    }

    /**
     * Starting the ForestBot API.
     */
    async startServer(this: ForestApi) {
        try {
            await this.server.register(cors, {});
            await this.server.register(websocket);
            await this.loadRoutesRecursive("./dist/controllers");

            await this.server.listen({ port: this.port });
            Logger.success(`API started. Listening on port: ${this.port}`, "ForestBotAPI");
            return;
        } catch (err) {
            console.error(err);
            this.server.log.error(err, " Caught an error while trying to start the server");
            return process.exit(1);
        }
    }

    /**
     * Updating player list for a specific Minecraft server.
     * Data here will be used for tablist generation and to determine if a bot is connected.
     * @param mc_server - The Minecraft server identifier
     * @param users - List of players
     */
    public async updatePlayerList(mc_server: string, users: PlayerList[]): Promise<void> {
        await InsertPlayerPlaytime(users);

        const serverData = this.connectedServers.get(mc_server);
        if (serverData) {
            // Server is already connected, update the player list
            serverData.playerlist = users;

            // Add player avatars for players who don't already have one
            for (const user of serverData.playerlist) {
                if (!user.headurl) {
                    try {
                        user.headurl = await fetchAvatar(user.username);
                    } catch (err) {
                        continue;
                    }
                }
            }

            // Update the timestamp to mark the player list as updated
            serverData.timestamp = Date.now();
            this.connectedServers.set(mc_server, serverData);
        } else {
            // Server is not connected, create a new entry for it
            const playerlist: PlayerList[] = [];
            for (const user of users) {
                let headurl: Canvas.Image;
                try {
                    headurl = await fetchAvatar(user.username);
                } catch (err) {
                    continue;
                }
                playerlist.push({ ...user, headurl: headurl });
            }

            Logger.minecraft(`bot: ${mc_server} connected.`, "ForestBotAPI");
            this.connectedServers.set(mc_server, { playerlist: playerlist, timestamp: Date.now() });
        }
    }

    /**
     * Checking the list of connected servers and the last time they pinged.
     * This gets called every 2 minutes.
     */
    private checkConnectedServers() {
        const now = Date.now();
        for (const [server, data] of this.connectedServers) {
            if (!server || !data) return;
            if (now - data.timestamp > 2 * 60000) {
                this.connectedServers.delete(server);
                Logger.minecraft(`bot: ${server} has not been heard from in 2 minutes.`, "ForestBotAPI");
            }
        }
    }

    /**
     * Loading API endpoints recursively from the specified directory.
     * @param routePath - The path to the directory containing route files
     */
    async loadRoutesRecursive(routePath: string) {
        const files = await fs.readdir(routePath);
        try {
            for (const file of files) {
                const filePath = path.join(routePath, file);
                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    await this.loadRoutesRecursive(filePath);
                } else if (file.endsWith(".js")) {
                    const routeItem: RouteItem = (await import(`../../../${filePath.replace(/\\/g, '/')}`)).default;
                    this.server.route({
                        method: routeItem.method,
                        url: routeItem.url,
                        json: routeItem.json,
                        websocket: routeItem.useWebsocket,
                        handler: (req, reply) => {
                            if (routeItem.useWebsocket) {
                                routeItem.handler(req, reply, this.database, this);
                                return;
                            }
                            if (routeItem.isPrivate && req.headers["x-api-key"] !== process.env.APIKEY) {
                                reply.status(401).send({ error: 'Unauthorized' });
                                return;
                            } else {
                                routeItem.handler(req, reply, this.database, this);
                            }
                        }
                    } as RouteOptions);
                    Logger.success(`${routeItem.method}: ${routeItem.url} loaded`, "APIROUTE");
                }
            }
        } catch (err) {
            console.error(err, " Error while trying to load routes.");
        }
    }
}