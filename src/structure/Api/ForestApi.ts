import type { FastifyInstance } from 'fastify';
import websocket from "@fastify/websocket";
import type { SocketStream } from "@fastify/websocket";
import type { PlayerList, RouteItem } from '../../../index.js';
import cors from '@fastify/cors'
import Fastify, { RouteOptions } from 'fastify';
import fs from "fs/promises";
import Database from '../database/createPool.js';
import cron from "node-cron"
import Canvas from "canvas";

async function fetchAvatar(name: string): Promise<Canvas.Image> {
    let img: Canvas.Image;
    try {
        img = await Canvas.loadImage(`https://mc-heads.net/avatar/${name}/16`);
        return img;
    } catch (err) {
        img = await Canvas.loadImage("https://mc-heads.net/avatar/steve/16")
        return img;
    }
}

export default class ForestApi {
    public server: FastifyInstance;
    public database: Database;
    public connectedClients: Map<string, SocketStream> = new Map();
    public connectedServers: Map<string, { playerlist: PlayerList[], timestamp: number }> = new Map();

    constructor(private port: number) {
        this.server = Fastify();
        this.server.setNotFoundHandler(async (request, reply) => await reply.code(404).type('text/html').send('Route not found.'))
        this.startServer();
        this.database = new Database();

        cron.schedule('*/2 * * * *', () => {
            this.checkConnectedServers();
        })
    }

    public async updatePlayerList(mc_server: string, users: PlayerList[]): Promise<void> {
        const serverData = this.connectedServers.get(mc_server);
        if (serverData) {
            // Server is already connected, update the player list
            serverData.playerlist = users;

            // Add player avatars for players who don't already have one
            for (const user of serverData.playerlist) {
                if (!user.headurl) {
                    try {
                        user.headurl = await fetchAvatar(user.name);
                    } catch (err) {
                        // Handle error fetching avatar
                        console.error(`Error fetching avatar for user ${user.name}: ${err}`);
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
                    headurl = await fetchAvatar(user.name);
                } catch (err) {
                    // Handle error fetching avatar
                    console.error(`Error fetching avatar for user ${user.name}: ${err}`);
                }
                playerlist.push({ ...user, headurl: headurl });
            }
            console.log(`${mc_server} connected to api.`)
            this.connectedServers.set(mc_server, { playerlist: playerlist, timestamp: Date.now() });
        }
    }


    private checkConnectedServers() {
        const now = Date.now();
        for (const [server, data] of this.connectedServers) {
            if (!server || !data) return;
            if (now - data.timestamp > 2 * 60000) {
                this.connectedServers.delete(server);
                console.log(`${server} removed from list because 2 minutes without a ping.`)
            }
        }
    }

    async loadRoutes() {
        const routePath = './dist/controllers';
        for (const dir of await fs.readdir(routePath)) {
            if ((await fs.stat(routePath + '/' + dir)).isDirectory()) {
                for (const file of await fs.readdir(routePath + '/' + dir)) {
                    if (file.endsWith('.js')) {
                        const routeItem: RouteItem = (await import(`../../controllers/${dir}/${file}`)).default;
                        this.server.route({
                            method: routeItem.method,
                            url: routeItem.url,
                            json: routeItem.json,
                            websocket: routeItem.useWebsocket,
                            handler: (req, reply) => {
                                routeItem.handler(req, reply, this.database, this)
                            }
                        } as RouteOptions);
                        console.log(`Loaded route: ${routeItem.method}: ${routeItem.url}`)
                    }
                }
            }
        }
    }

    async startServer(this: ForestApi) {
        try {
            await this.server.register(cors, {})
            await this.server.register(websocket);
            await this.loadRoutes();
            await this.server.listen({ port: this.port })
            return console.log("Listening on port: " + this.port)
        }
        catch (err) {
            console.log(err)
            this.server.log.error(err);
            return process.exit(1);
        }
    }
}