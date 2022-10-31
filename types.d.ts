import { FastifyRequest, FastifyReply } from 'fastify'; 

export type RouteItem = {
    method: string,
    url: string,
    json: boolean,
    schema?: {},
    handler: (req: FastifyRequest, reply: FastifyReply) => void,
    isPrivate?: boolean
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
}