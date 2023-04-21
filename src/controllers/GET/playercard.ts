import { FastifyReply, FastifyRequest } from "fastify";
import { RouteItem } from "../../..";
import type { database } from "../../structure/database/createPool";
import generateUserCard from "../../util/generate/card/draw.js";


const exampleData = {

}

const data = {
    username: "febzey",
    kills: 10,
    deaths: 10,
    joindate: "Feb 10th 2021"
}


///:user/:server
export default {
    method: "GET",
    url: "/card",
    json: true,
    isPrivate: false,
    handler: async (req: FastifyRequest, reply: FastifyReply, database: database) => {

        const serv: string = req.params['server'];
        const user: string = req.params['user'];

        const card = await generateUserCard(
            data.username,
            "https://api.mineatar.io/body/front/Febzey",
            data.joindate, data.kills,
            data.deaths
        );
        reply.type('image/png').send(card);
    }
} as RouteItem;