import fastify, { RouteOptions } from 'fastify';
import Routes from '../../routes/routes.js';
import type { FastifyInstance } from 'fastify';

export default class ForestApi {
    public server: FastifyInstance;

    constructor(public port: number) {
        this.server = fastify();
        this.server.setNotFoundHandler((request, reply) => reply.code(404).type('text/html').send('Route not found.'))
        this.startServer();
    }

    loadRoutes() {
        for (const route of Routes) {
            this.server.route(route as RouteOptions)
            console.log("Loaded route: " + route.url)
        }
    }

    async startServer() {
        try {
            this.loadRoutes();
            await this.server.listen(this.port)
            return console.log("Listening on port: " + this.port)
        }
        catch (err) {
            this.server.log.error(err);
            return process.exit(1);
        }
    }
}