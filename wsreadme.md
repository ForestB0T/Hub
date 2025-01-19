# WebSocket Authentication and Message Handling

This document explains the functionality, usage, and inner workings of the `auth.ts` file, which handles WebSocket authentication and message processing for the ForestBot Hub.

## Overview

The `auth.ts` file is responsible for managing WebSocket connections, authenticating clients, and handling various types of messages exchanged between the server and clients. It supports both Discord and Minecraft clients, enabling real-time communication and data synchronization.

## Key Components

### 1. WebSocket Client Map

A map to store WebSocket connections, identified by a unique key combining the client type and server name.

### 2. Broadcast Function

A function to broadcast messages to all connected clients. This ensures that all clients receive real-time updates.

### 3. Message Handlers

An array of message handlers for different client types (Discord and Minecraft). Each handler processes specific types of messages and performs corresponding actions. The handlers are responsible for:

- **Discord Messages**: Handling chat messages from Discord and forwarding them to Minecraft clients.
- **Minecraft Messages**: Handling various Minecraft events such as chat messages, player deaths, player joins, player leaves, and advancements. These events are saved to the database and broadcasted to all clients.

### 4. WebSocket Route

Defines the WebSocket route for clients to connect, authenticate, and handle messages. The route performs the following steps:

1. **Client Connection**: Clients connect to the WebSocket server using the `/websocket/connect` route.
2. **Authentication**: The server checks the client's API key and client type. If valid, the client is added to the `WebSocket_Client_Map`.
3. **Message Handling**: The server listens for messages from the client. Based on the message type, the appropriate handler processes the message and performs actions such as saving data to the database or broadcasting messages to other clients.
4. **Ping and Close Events**: The server handles ping messages to keep the connection alive and manages client disconnections by removing them from the `WebSocket_Client_Map`.

## Action Events and Data Handling

### 1. Inbound Discord Chat

- **Action**: `inbound_discord_chat`
- **Data**: `{ username, message, mc_server }`
- **Description**: Forwards chat messages from Discord to the corresponding Minecraft server.

### 2. Inbound Minecraft Chat

- **Action**: `inbound_minecraft_chat`
- **Data**: `{ name, mc_server, message, uuid }`
- **Description**: Saves chat messages from Minecraft to the database and broadcasts them to all clients.

### 3. Minecraft Player Death

- **Action**: `minecraft_player_death`
- **Data**: `{ victim, death_message, murderer, time, mc_server, type, victimUUID, murdererUUID }`
- **Description**: Saves player death events to the database and broadcasts them to all clients.

### 4. Minecraft Player Join

- **Action**: `minecraft_player_join`
- **Data**: `{ username, uuid, server, timestamp }`
- **Description**: Saves player join events to the database and broadcasts them to all clients.

### 5. Minecraft Player Leave

- **Action**: `minecraft_player_leave`
- **Data**: `{ server, timestamp, username, uuid }`
- **Description**: Saves player leave events to the database and broadcasts them to all clients.

### 6. Minecraft Advancement

- **Action**: `minecraft_advancement`
- **Data**: `{ username, advancement, mc_server, time, uuid }`
- **Description**: Saves player advancements to the database and broadcasts them to all clients.

### 7. Update Player List

- **Action**: `send_update_player_list`
- **Data**: `{ players }`
- **Description**: Updates the player list for a specific server.

## Usage

To use the WebSocket API, clients must:

1. Connect to the WebSocket server using the `/websocket/connect` route.
2. Provide a valid API key and client type in the headers.
3. Send messages in the expected format for the server to process and respond accordingly.

This setup ensures secure and efficient real-time communication between the ForestBot Hub and its clients.
