import { httpServer } from './http-server.js';
import { WebSocketServer } from 'ws';

export const webSocketServer = new WebSocketServer({ server: httpServer})
