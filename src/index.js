require('dotenv').config();
const express = require('express');
const DockerContainerRoutes = require('./routes/DockerContainerRoutes');
const ErrorHandlerMiddleware = require('./middlewares/ErrorHandlerMiddleware');
const {startWebSocketServer} = require('./service/WebSocketsService');
const cors = require('cors');
const app = express();

const WSS = startWebSocketServer();

app.use(cors());
app.use(express.json());

app.use('/api', DockerContainerRoutes);
app.use(ErrorHandlerMiddleware);

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
    console.log("Started app on port: " + PORT);
});

module.exports = {
    WSS
}