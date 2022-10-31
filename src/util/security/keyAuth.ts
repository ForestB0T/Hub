import type { FastifyReply } from "fastify";

const checkPrivateKey = (key: string|number, reply: FastifyReply) => { 
    const privateKey = process.env.APIKEY;
    if (key !== privateKey) {
        reply.code(501).send({ Error: "Private keys do not match." })
        return false;
    }
    return true;
}

export default checkPrivateKey;