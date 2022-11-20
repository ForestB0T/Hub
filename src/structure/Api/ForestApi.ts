import type { WebSocketServer } from 'ws';
import type { FastifyInstance } from 'fastify';;
import { RouteItem } from '../../../types.js';
import fastify, { RouteOptions } from 'fastify';
import fs from "fs/promises";
import database from '../database/createPool.js';
import Websocket from '../Websocket/Websocket.js';

export default class ForestApi {
    public server: FastifyInstance;
    public ws: Websocket;
    public wsServer: WebSocketServer;

    constructor(private port: number) {
        this.server = fastify();
        this.server.setNotFoundHandler((request, reply) => reply.code(404).type('text/html').send('Route not found.'))
        this.startServer();
        this.ws = new Websocket(8080);
        this.wsServer = this.ws.wss;
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
                            handler: (req, reply) => routeItem.handler(req, reply, database)
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