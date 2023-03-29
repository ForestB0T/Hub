> # The ForestBot API 

This API stores and retrieves user data related to a Minecraft server, including chat messages, player kills and deaths, advancements, playtime, and more. The stored data is essential for the functioning of the bots as they rely on it to display live server statistics and provide various commands and features to players.

> API URL: [https://api.forestbot.org](https://api.forestbot.org) <br>
> Website URL: [https://forestbot.org](https://forestbot.org)

# Public Routes:

### GET: /advancements/:username/:server/:limit/:type

Retrieves a list of advancements for a specific user on a specific server, limited by the specified limit and type.

**Parameters:**
- `username` (string): The username of the user to retrieve advancements for.
- `server` (string): The Minecraft server to retrieve advancements from.
- `limit` (number): The maximum number of advancements to retrieve.
- `type` (string): the order of advancements you want to retrieve. (e.g. `desc`, `asc`).

### GET: /user-stats/:username

Retrieves statistics for a specific user.

**Parameters:**
- `username` (string): The username of the user to retrieve statistics for.

### GET: /deaths/:username/:server/:limit/:type

Retrieves a list of deaths for a specific user on a specific server, limited by the specified limit and type.

**Parameters:**
- `username` (string): The username of the user to retrieve deaths for.
- `server` (string): The Minecraft server to retrieve deaths from.
- `limit` (number): The maximum number of deaths to retrieve.
- `type` (string): the order of deaths you want to retrieve. (e.g. `desc`, `asc`).

### GET: /kills/:username/:server/:limit/:type

Retrieves a list of kills for a specific user on a specific server, limited by the specified limit and type.

**Parameters:**
- `username` (string): The username of the user to retrieve kills for.
- `server` (string): The Minecraft server to retrieve kills from.
- `limit` (number): The maximum number of kills to retrieve.
- `type` (string): the order of kills you want to retrieve. (e.g. `desc`, `asc`).

### GET: /getchannels/:server/:key

Retrieves the list of channels for a specific server.

**Parameters:**
- `server` (string): The Minecraft server to retrieve channels from.
- `key` (string): The API key to authenticate the request.

### GET: /joins/:user/:server

Retrieves a list of join times for a specific user on a specific server.

**Parameters:**
- `user` (string): The username of the user to retrieve join times for.
- `server` (string): The Minecraft server to retrieve join times from.

### GET: /joindate/:user/:server

Retrieves the first join date for a specific user on a specific server.

**Parameters:**
- `user` (string): The username of the user to retrieve the first join date for.
- `server` (string): The Minecraft server to retrieve the first join date from.

### GET: /kd/:user/:server

Retrieves the kill/death ratio for a specific user on a specific server.

**Parameters:**
- `user` (string): The username of the user to retrieve the kill/death ratio for.
- `server` (string): The Minecraft server to retrieve the kill/death ratio from.

### GET: /lastdeath/:user/:server

Retrieves the last death message for a specific user on a specific server.

**Parameters:**
- `user` (string): The username of the user to retrieve the last death message for.
- `server` (string): The Minecraft server to retrieve the last death message from.

### GET: /lastseen/:user/:server

Returns the timestamp of when the specified user was last seen on the specified server.

**Parameters**
- `user`: the username of the user to lookup (string)
- `server`: the name of the server to lookup (string)

**Returns**
- `timestamp`: the Unix timestamp of when the user was last seen on the server (number)

### GET: /messagecount/:user/:server

Returns the total number of chat messages sent by the specified user on the specified server.

**Parameters**
- `user`: the username of the user to lookup (string)
- `server`: the name of the server to lookup (string)

**Returns**
- `count`: the total number of chat messages sent by the user on the server (number)

### GET: /messages/:username/:server/:limit/:type

Returns the chat messages sent by the specified user on the specified server.

**Parameters**
- `username`: the username of the user to lookup (string)
- `server`: the name of the server to lookup (string)
- `limit`: the maximum number of messages to return (number)
- `type` (string): the order of messages you want to retrieve. (e.g. `desc`, `asc`).

**Returns**
- `messages`: an array of chat messages sent by the user on the server (array of strings)

### GET: /isonline/:user

Returns whether the specified user is currently online on any server.

**Parameters**
- `user`: the username of the user to lookup (string)

**Returns**
- `isonline`: whether the user is currently online on any server (boolean)

### GET: /playtime/:user/:server

Returns the total playtime of the specified user on the specified server.

**Parameters**
- `user`: the username of the user to lookup (string)
- `server`: the name of the server to lookup (string)

**Returns**
- `playtime`: the total playtime of the user on the server in seconds (number)

### GET: /quote/:user/:server

Returns a random quote from the chat messages sent by the specified user on the specified server.

**Parameters**
- `user`: the username of the user to lookup (string)
- `server`: the name of the server to lookup (string)

**Returns**
- `quote`: a random quote from the chat messages sent by the user on the server (string)

### GET: /lastadvancements

Returns the list of users who have earned advancements most recently.

**Returns**
- `users`: an array of user objects, each containing the username and the Unix timestamp of when the user earned an advancement (array of objects)

### GET: /lastdeaths

Returns the list of users who have died most recently.

**Returns**
- `users`: an array of user objects, each containing the username, the Unix timestamp of when the user died, and the cause of death (array of objects)

### GET: /user/:user/:server

Returns the user data for the specified user on the specified server.

**Parameters**
- `user`: the username of the user to lookup (string)
- `server`: the name of the server to lookup (string)

**Returns**
- `user`: an object containing the user data, including the username, UUID, rank, first join date, and last join date (object)

### Route: GET /tab/:server

Returns the current tablist of the specified Minecraft server.

Query Parameters:
- `server` (required): The Minecraft server name to query.

Example Usage:
`GET /tab/survival`


### Route: GET /topstat/:stat/:server

Returns a list of users with the highest value of the specified stat for the specified Minecraft server.

Query Parameters:
- `server` (required): The Minecraft server name to query.
- `stat` (required): The stat to sort by. Options are "kills", "deaths", "advancements", "messagecount", "playtime", "joins".

Example Usage:
`GET /topstat/kills/survival`


### Route: GET /wordcount/:word/:user/:server

Returns the count of the specified word for the specified user on the specified Minecraft server.

Query Parameters:
- `server` (required): The Minecraft server name to query.
- `user` (required): The username to query.
- `word` (required): The word to search for.

Example Usage:
`GET /wordcount/hello/player123/survival`





# Private Routes:

### POST /saveadvancement/:key

Save user advancement to the database.

- `user`: string - username of the player
- `advancement`: string - advancement achieved by the player
- `mc_server`: string - server name

### POST /savechat

Save user chat message to the database.

- Header: `x-api-key`: string - private API key
- Websocket message input: `{ username: string, message: string, mc_server: string }`

### POST /savepvekill/:key

Save user PVE kill to the database.

- `victim`: string - username of the player killed
- `deathmsg`: string - death message
- `mc_server`: string - server name
- `timestamp`: number - Unix timestamp of the kill

### POST /updatejoin/:key

Update user join time in the database.

- `user`: string - username of the player
- `uuid`: string - player UUID
- `mc_server`: string - server name
- `time`: number - Unix timestamp of the join time

### POST /savepvpkill/:key

Save user PVP kill to the database.

- `murderer`: string - username of the player who killed
- `victim`: string - username of the player killed
- `deathmsg`: string - death message
- `mc_server`: string - server name
- `timestamp`: number - Unix timestamp of the kill

### POST /saveplaytime/:key

Save user playtime to the database.

- `mc_server`: string - server name
- `players`: array of strings - usernames of the players

### POST /updateplayerlist/:key

Update player list in the database.

- `mc_server`: string - server name
- `users`: array of objects - `{ name: string, ping: number, headurl?: Canvas.Image }`

### POST /updateleave/:key

Update user leave time in the database.

- `user`: string - username of the player
- `mc_server`: string - server name
- `time`: number - Unix timestamp of the leave time
