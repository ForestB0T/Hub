import WebSocket, { Data, WebSocketServer } from 'ws';

export default class Websocket {

    public wss: WebSocketServer;
    public collectedWebsockets: Map<string, WebSocket.WebSocket>

    public playerLists: Map<string, [{ name: string, ping: number }]> = new Map();

    constructor(public port: number) {
        this.start();
        this.collectedWebsockets = new Map();
        this.wss.on("error", (err) => {
            console.error(err.message);
        });
    }

    start() {
        console.log("Starting websocket.")
        this.wss = new WebSocketServer({ port: this.port });
        this.wss.on('connection', (ws, request) => {
            console.log("Connected websocket: " + request.url);
            this.collectedWebsockets.set(request.url, ws);
          
            
            ws.on("message", (data) => { 
                const json = JSON.parse(data.toString());
                if(json.type === "tablist") {
                    const { mc_server, playerlist } = json;
                    this.updatePlayerList(mc_server, playerlist);
                }
    
            })

            ws.on('close', () => {
                console.log("Closed websocket: " + request.url);
                this.collectedWebsockets.delete(request.url);
            });
        })
    }

    updatePlayerList(server: string, players: [{ name: string, ping: number }]) {
        return this.playerLists.set(server, JSON.parse(players.toString()));
    }
}