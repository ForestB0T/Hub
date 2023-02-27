import { FastifyRequest, FastifyReply } from 'fastify'; 
import ForestApi from './src/structure/Api/ForestApi';
import Database from './src/structure/database/createPool';

export type RouteItem = {
    method: string,
    url: string,
    json: boolean,
    schema?: {},
    isPrivate?: boolean
    handler: (req: FastifyRequest, reply: FastifyReply, database?:Database, this: ForestApi) => void,
};

export type allStats = { 
    username: string,
    kills: number,
    deaths: number,
    joindate: string,
    lastseen: string,
    uuid: string,
    playtime: number,
    joins: number,
    lastdeathString: string,
    lastdeathTime: number,
    id: number
    mc_server: string
}

interface PlayerList {
    name: string;
    ping: number;
}
