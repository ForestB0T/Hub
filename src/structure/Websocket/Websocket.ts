import WebSocket, { WebSocketServer } from 'ws';

export default class Websocket {

    public wss: WebSocketServer;
    public collectedWebsockets: Map<string, WebSocket.WebSocket>

    constructor(public port: number) {
        this.start();
        this.collectedWebsockets = new Map();
        this.wss.on("error", (err) => {
            console.error(err.message);
        });
    }

    start() {
        console.log("Starting websocket.")
        this.wss = new WebSocketServer({
            port: this.port,
            
        });
        this.wss.on('connection', (ws, request) => {
            console.log("Connected websocket: " + request.url);
            this.collectedWebsockets.set(request.url, ws);

            ws.on('close', () => {
                console.log("Closed websocket: " + request.url);
                this.collectedWebsockets.delete(request.url);
            });
        })
    }
}