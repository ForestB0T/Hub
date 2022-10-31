import { port } from './config.js';
import ForestApi from './structure/Api/ForestApi.js';
import Websocket from './structure/Websocket/Websocket.js';

new ForestApi(port);
export const ws = new Websocket(8080);
