import httpServer from './http-server.js';
import { WebSocketServer } from 'ws';

const webSocketServer = new WebSocketServer({ server: httpServer})

module.exports = webSocketServer
