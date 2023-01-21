import type { FastifyInstance } from 'fastify';;
import type { PlayerList, RouteItem } from '../../../index.js';
import fastify, { RouteOptions } from 'fastify';
import fs from "fs/promises";
import Database from '../database/createPool.js';
import cron from "node-cron"

export default class ForestApi {
    public server: FastifyInstance;
    public database: Database;

    public connectedServers: Map<string, {playerlist: PlayerList[], timestamp: number}> = new Map();

    constructor(private port: number) {
        this.server = fastify();
        this.server.setNotFoundHandler((request, reply) => reply.code(404).type('text/html').send('Route not found.'))
        this.startServer();
        this.database = new Database();

        cron.schedule('*/2 * * * *', () => {
            this.checkConnectedServers();
            console.log("Ran")
        })
    }

    public async updatePlayerList(mc_server: string, users: PlayerList[]): Promise<void> {
        this.connectedServers.set(mc_server, { playerlist: users, timestamp: Date.now() });
    }

    private checkConnectedServers() {
        const now = Date.now();
        for (const [server, data] of this.connectedServers) {
            if (!server || !data) return;
            if (now - data.timestamp > 2 * 60000) {
                this.connectedServers.delete(server);
                console.log("Deleted cuz 2 mins no ping")
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
                            handler: (req, reply) => routeItem.handler(req, reply, this.database)
                        } as RouteOptions);
                        console.log(`Loaded route: ${routeItem.method}: ${routeItem.url}`)
                    }
                }
            }
        }
    }

    async startServer() {
        try {
            await this.loadRoutes();
            await this.server.listen(this.port)
            return console.log("Listening on port: " + this.port)
        }
        catch (err) {
            this.server.log.error(err);
            return process.exit(1);
        }
    }
}