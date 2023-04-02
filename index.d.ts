import { FastifyRequest, FastifyReply } from 'fastify'; 
import type { SocketStream } from "@fastify/websocket";
import ForestApi from './src/structure/Api/ForestApi';
import Database from './src/structure/database/createPool';
import { type Image } from 'canvas';

export type RouteItem = {
    method: string,
    url: string,
    json: boolean,
    schema?: {},
    isPrivate?: boolean,
    useWebsocket?: boolean,
    handler: (req: FastifyRequest|SocketStream, reply: FastifyReply, database?:Database, this: ForestApi) => void,
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

type PlayerList = {
    name: string;
    ping: number;
    headurl?: Image
}

interface MinecraftChatMessage {
    name: string,
    message: string,
    mc_server: string,
    date?: string
}

interface MinecraftChatAdvancement {
    username: string,
    advancement: string,
    time: number,
    mc_server: string
}

interface MinecraftPlayerJoinArgs {
    user: string,
    uuid: string,
    mc_server: string,
    time: string
}

interface MinecraftPlayerLeaveArgs {
    username: string,
    mc_server: string,
    time: string
}

interface MinecraftPlayerDeath {
    victim?: string,
    death_message: string,
    murderer?: string,
    time: number,
    type: "pve"|"pvp",
    mc_server: string
}

interface DiscordGuild {
    guild_id: string,
    channel_id: string,
    mc_server: string,
    setup_by: string,
    created_at: number,
    guild_name: string
};

interface DiscordForestBotLiveChat {
    guildName: string
    guildID: string
    channelID: string
    setupBy: string
    date: string,
    mc_server: string
}

interface WebsocketMessage {
    type: string;
    data: Record<string, any>;
}

interface FromDiscordLiveChatMessage {
    username: string,
    message: string,
    time: number,
    mc_server: string
}


type AddGuildArgs = DiscordGuild;
type RemoveLiveChatArgs = { guild_id: string, channel_id?: string };
type AddLiveChatArgs = DiscordForestBotLiveChat;
type RemoveGuildArgs = { guild_id: string };

interface DiscordMessage {
    type: "discord";
    action: "chat"
    data: FromDiscordLiveChatMessage;
    guildId: string;
}

interface MinecraftMessage {
    type: "minecraft";
    action: "savechat"|"savejoin"|"savedeath"|"saveadvancement"|"saveleave"
    data: MinecraftPlayerLeaveArgs|MinecraftPlayerJoinArgs|MinecraftChatMessage|MinecraftChatAdvancement|MinecraftPlayerDeath
    mcServer: string;
}

interface MessageHandler {
    type: string;
    handler: (message: WebsocketMessage | DiscordMessage | MinecraftMessage, connection: SocketStream) => Promise<void>;
}