import ErrorHandlerMiddleware from './middlewares/ErrorHandlerMiddleware';
import startWebSocketServerWithDocker from './service/DockerWsService';
import DockerContainerRoutes from './routes/DockerContainerRoutes';
import httpServer from './http-server.js';
import express from 'express';
import dotenv from 'dotenv';

const app = express()

dotenv.config()
startWebSocketServerWithDocker()

app.use(express.json())
app.use('/api', DockerContainerRoutes)
app.use(ErrorHandlerMiddleware)

const PORT = process.env.PORT ? process.env.PORT : 80
httpServer.on('request', app)

httpServer.listen(PORT, () =>{
    console.log(`http/ws server listening on ${PORT}`)
})