import type { FastifyInstance } from 'fastify';;
import { RouteItem } from '../../../types.js';
import fastify, { RouteOptions } from 'fastify';
import fs from "fs/promises";
import Database from '../database/createPool.js';

export default class ForestApi {
    public server: FastifyInstance;
    public database: Database;
    public playerLists: Map<string, [{ name: string, ping: number }]> = new Map();


    constructor(private port: number) {
        this.server = fastify();
        this.server.setNotFoundHandler((request, reply) => reply.code(404).type('text/html').send('Route not found.'))
        this.startServer();
        this.database = new Database();
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