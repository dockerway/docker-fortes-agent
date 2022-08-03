require('dotenv').config();

const express = require('express');
const server = require('http').createServer();
const {startWebSocketServer} = require('./service/WebSocketsService');

const DockerContainerRoutes = require('./routes/DockerContainerRoutes');
const ErrorHandlerMiddleware = require('./middlewares/ErrorHandlerMiddleware');

const app = express();
const WSS = startWebSocketServer(server);

app.use(express.json());
app.use('/api', DockerContainerRoutes);
app.use(ErrorHandlerMiddleware);


const PORT = process.env.PORT || 80;
server.on('request', app);
server.listen(PORT, () =>{
    console.log(`http/ws server listening on ${process.env.PORT}`);
});

module.exports = {
    WSS
}