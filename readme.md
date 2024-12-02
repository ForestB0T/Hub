> # The ForestBot API 

# ForestBot Hub  

The ForestBot Hub serves as the backbone for connecting all ForestBot instances, facilitating real-time data exchange and providing REST API endpoints for comprehensive server and player data.  

## Overview  

ForestBot Hub is a centralized API and data processing service designed to manage, analyze, and serve Minecraft server data. It provides seamless WebSocket-based communication for real-time updates and powerful REST API endpoints for fetching and managing server statistics.  

## Features  

### WebSocket Support  
- Enables bi-directional, real-time communication with connected ForestBot instances.  
- Transmits live data, including:  
- Player kills  
- Messages sent  
- Player deaths  
- Player joins and leaves  

### Dynamic Tablist Generation  
- Compiles and serves real-time tablist data for connected servers.  

### REST API Endpoints  
- Provides access to detailed server and player statistics.  
- Supports fetching specific player data, server analytics, and leaderboard information.  

### Database Management  
- Handles all database operations, ensuring efficient and reliable data storage.  
- Manages player sessions, recording:  
- Join and leave times  
- Total playtime  
- Player activity stats  

### Player Session Management  
- Tracks individual player sessions for granular data, enabling features like:  
- Daily activity breakdowns  
- Historical data analysis  

### Requirements  
- Node.js (version 20.x.x or higher)  
- A running MariaDB instance for data storage  
- Web server or reverse proxy for serving the API  

<br>
<br>

> API URL: [https://api.forestbot.org](https://api.forestbot.org) <br>
> Website URL: [https://forestbot.org](https://forestbot.org)

<br>
<br>
<br>
<br>



### Public Routes

## 1. Advancements  
**GET** /advancements?uuid=<uuid>&server=<server>&limit=<limit>&order=<order>  
Retrieves a user's advancements on a specific server.  
**Response Example:**  
```
{
    "username": "player123",  
    "advancement": "First Steps",  
    "time": 1616161616161,  
    "mc_server": "server1",  
    "uuid": "player-uuid"  
}
```
---

## 2. All Servers  
**GET** /all-servers  
Gets a list of all available servers in the database.  
**Response Example:**  
```
[  
    { "mc_server": "server1" },  
    { "mc_server": "server2" }  
]
```
---

## 3. All User Stats  
**GET** /all-user-stats?uuid=<uuid>  
Gets a comprehensive list of stats for a specific user across all servers.  
**Response Example:**  
```
[  
    {  
        "username": "player123",  
        "kills": 20,  
        "deaths": 10,  
        "joindate": "2021-01-01T12:00:00Z",  
        "lastseen": "2021-12-01T12:00:00Z",  
        "UUID": "player-uuid",  
        "playtime": 1200,  
        "joins": 15,  
        "leaves": 14,  
        "lastdeathTime": 1616161616161,  
        "lastdeathString": "Killed by skeleton",  
        "mc_server": "server1"  
    }  
]
```
---

## 4. Deaths  
**GET** /deaths?uuid=<uuid>&server=<server>&limit=<limit>&order=<order>&type=<type>  
Retrieves all death records for a user, filtered by type (PvP/PvE).  
**Response Example:**  
```
{  
    "victim": "player123",  
    "death_message": "Killed by zombie",  
    "time": 1616161616161,  
    "type": "pve",  
    "mc_server": "server1",  
    "victimUUID": "player-uuid"  
}
```
---

## 5. Kills  
**GET** /kills?uuid=<uuid>&server=<server>&limit=<limit>&order=<order>  
Gets all kill records for a user.  
**Response Example:**  
```
{  
    "victim": "player456",  
    "death_message": "Killed by player123",  
    "time": 1616161616161,  
    "type": "pvp",  
    "mc_server": "server1",  
    "victimUUID": "player-uuid"  
}
```

---

## 6. FAQ  
**GET** /faq?id=<id>&server=<server>  
Retrieves a random FAQ entry from the database.  
**Response Example:**  
```
{  
    "username": "admin",  
    "uuid": "admin-uuid",  
    "server": "server1",  
    "id": 123,  
    "faq": "How to play on the server?",  
    "timestamp": "2021-12-01T12:00:00Z",  
    "total": 5  
}
```

---

## 7. Message Count  
**GET** /messagecount?username=<username>&server=<server>  
Gets the number of messages sent by a user on a specific server.  
**Response Example:**  
```
{  
    "count": 42  
}
```

---

## 8. Messages  
**GET** /messages?name=<username>&server=<server>&limit=<limit>&order=<order>  
Retrieves all messages sent by a user on a server.  
**Response Example:**  
```
{  
    "name": "player123",  
    "message": "Hello!",  
    "date": "2021-12-01T12:00:00Z",  
    "mc_server": "server1",  
    "uuid": "player-uuid"  
}
```

---

## 9. Name Search  
**GET** /namesearch?user=<search_term>&server=<server>  
Gets likely usernames related to your search term.  
**Response Example:**  
```
[  
    "player123",  
    "player456",  
    "player789"  
]
```

---

## 10. Online Status  
**GET** /online?user=<username>  
Checks if a user is online and which server they are on.  
**Response Example:**  
```
{  
    "online": true,  
    "server": "server1"  
}
```

---

## 11. Random Quote  
**GET** /quote?name=<username>&server=<server>  
Gets a random quoted message from a user.  
**Response Example:**  
```
{  
    "message": "Hello world!",  
    "date": "2021-12-01T12:00:00Z"  
}
```

---

## 12. User Stats on a Specific Server  
**GET** /user?server=<server>&uuid=<uuid>  
Gets stats for a specific user on a specific server.  
**Response Example:**  
```
{  
    "username": "player123",  
    "kills": 20,  
    "deaths": 10,  
    "joindate": "2021-01-01T12:00:00Z",  
    "lastseen": "2021-12-01T12:00:00Z",  
    "uuid": "player-uuid",  
    "playtime": 1200,  
    "joins": 15,  
    "leaves": 14,  
    "lastdeathTime": 1616161616161,  
    "lastdeathString": "Killed by skeleton",  
    "mc_server": "server1"  
}
```

---

## 13. Tablist Image  
**GET** /tab/:server  
Gets a live tablist image for a specific server.  
**Response Example:**  
A live image representing the current tablist.

---

## 14. Top Statistic  
**GET** /top-statistic?statistic=<statistic>&server=<server>&limit=<limit>  
Gets the top 5 users in a specific statistic on a server.  
**Response Example:**  
```
[  
    { "username": "player123", "statistic": 100 },  
    { "username": "player456", "statistic": 90 },  
    { "username": "player789", "statistic": 85 }  
]
```

---

## 15. Convert Username to UUID  
**GET** /convert-username-to-uuid?username=<username>  
Converts a username to a UUID using the ForestBot database.  
**Response Example:**  
```
{  
    "uuid": "player-uuid"  
}
```

---

## 16. User Whois  
**GET** /whois?username=<username>  
Gets the description of a user.  
**Response Example:**  
```
{  
    "username": "player123",  
    "description": "A dedicated player who loves exploring."  
}
```

---

## 17. Word Count  
**GET** /wordcount?word=<word>&server=<server>&username=<username>  
Gets the count of how many times a user has sent a specific word.  
**Response Example:**  
```
{  
    "count": 10  
}
```

---

## 18. Historical Playtime Graph  
**GET** /player/playtime?uuid=<uuid>&date=<date>&server=<server>  
Gets historical playtime data for a specific user on a specific server.  
**Response Example:**  
```
{  
    "day": "2021-12-01",  
    "playtime": 120  
}
```

---

## 19. Advancements Count  
**GET** /advancements-count?uuid=<uuid>&server=<server>  
Gets the total advancement count for a user on a specific server.  
**Response Example:**  
```
{  
    "total": 5  
}
```
