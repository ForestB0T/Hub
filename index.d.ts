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
    username: string
    uuid: string
    latency: number
    server: string
    headurl?: Image
}

interface MinecraftChatMessage {
    name: string
    message: string
    date: string
    mc_server: string
    uuid?: string
}

interface MinecraftAdvancementMessage {
    username: string
    advancement: string
    time: number,
    mc_server: string,
    id?: number | null
    uuid: string
}


interface MinecraftPlayerJoinArgs {
    username: string,
    uuid: string,
    server: string,
    timestamp: string
}

interface MinecraftPlayerLeaveMessage {
    username: string
    uuid: string
    timestamp: string
    server: string
}

interface MinecraftPlayerDeath {
    victim: string;
    death_message: string;
    murderer?: string;
    time: number;
    type: "pve" | "pvp";
    mc_server: string;
    id?: number | null | undefined;
    victimUUID: string;
    murdererUUID?: string;
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
    action: "inbound_discord_chat"
    data: FromDiscordLiveChatMessage;
    guildId: string;
}

interface MinecraftMessage {
    type: "minecraft";
    action: "inbound_minecraft_chat"|"minecraft_player_join"|"minecraft_player_death"|"minecraft_advancement"|"minecraft_player_leave"|"send_update_player_list"
    data: PlayerList[]|MinecraftPlayerLeaveMessage|MinecraftPlayerJoinArgs|MinecraftChatMessage|MinecraftChatAdvancement|MinecraftPlayerDeath
    mcServer: string;
}

interface MessageHandler {
    type: string;
    handler: (message: WebsocketMessage | DiscordMessage | MinecraftMessage, connection: SocketStream) => Promise<void>;
}

interface Sessions {
    username: string;
    uuid: string;
    mc_server: string;
    join_time: string;
    leave_time: string;
    playtime: number;
    kills: number;
    deaths: number;
    advancements_gained: number
    messages_sent: number;
    timestamp: string;
}