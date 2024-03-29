const dotenv = require('dotenv')
const httpServer = require('./http-server.js')
const express = require('express');
const startWebSocketServerWithDocker = require('./service/DockerWsService')
const DockerContainerRoutes = require('./routes/DockerContainerRoutes');
const ErrorHandlerMiddleware = require('./middlewares/ErrorHandlerMiddleware');

const app = express();

dotenv.config()
startWebSocketServerWithDocker()

app.use(express.json());
app.use('/api', DockerContainerRoutes);
app.use(ErrorHandlerMiddleware);

const PORT = process.env.PORT ? process.env.PORT : 80
httpServer.on('request', app);

httpServer.listen(PORT, () =>{
    console.log(`http/ws server listening on ${PORT}`)
});