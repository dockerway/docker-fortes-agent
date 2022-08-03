require('dotenv').config();
const httpServer = require('./http-server.js')
const wsServer = require('./websocket-server')
const express = require('express');
const initializeWebSocketServer = require('./service/DockerWsService')
const DockerContainerRoutes = require('./routes/DockerContainerRoutes');
const ErrorHandlerMiddleware = require('./middlewares/ErrorHandlerMiddleware');

const app = express();

initializeWebSocketServer()

app.use(express.json());
app.use('/api', DockerContainerRoutes);
app.use(ErrorHandlerMiddleware);

const PORT = process.env.PORT || 80;
httpServer.on('request', app);
httpServer.listen(PORT, () =>{
    console.log(`http/ws server listening on ${process.env.PORT}`);
});

