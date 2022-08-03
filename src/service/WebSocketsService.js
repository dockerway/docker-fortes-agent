function startWebSocketServer(server){
    const { WebSocketServer } = require('ws');
    const webSocketServer = new WebSocketServer({ server: server});

    return webSocketServer;
}

function executeTerminalOnDockerTask(containerID, terminal, webSocketServer){
    const Docker = require('dockerode');

    webSocketServer.on('connection', (ws) => {
        console.log("Connection Made!: ", containerID);
        console.log("WebSocket: ", ws);
        ws.id = containerID
        const dockerInstance = new Docker();
        const selectedContainer = dockerInstance.getContainer(containerID);

        function handle(error){
            ws.send(error.toString());
            reject(error);
            console.error(error);
        };

        const executionParameters = {
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,

            Cmd: [`${terminal}`],
            interactive: true,
            tty: true
        };

        selectedContainer.exec(executionParameters, (error, exec) => {
            if (error) handle(error);

            exec.start({stdin: true, stdout: true, stderr: true },
                (error, stream) => {
                    if (error) handle(error);

                    ws.onmessage = (message) => {
                        const data = JSON.parse(message.data);

                        console.log(`RECEIVED From FRONT containerID received: '${data.containerId}' | PAYLOAD: '${data.payload}'`);

                        if(data.containerId == containerID){
                            stream.write(data.payload);
                        }
                    }; //write to container terminal

                    stream.on('data', (chunk) => {
                        const terminalMessage = {
                            containerId:containerID,
                            payload: chunk.toString()
                        };

                        console.log(`SENT to FRONT containerID: '${terminalMessage.containerId}'| PAYLOAD: '${terminalMessage.payload}'`);
                        ws.send(JSON.stringify(terminalMessage));
                    }); //send to client
                }
            );
        });
    });
}

module.exports = {startWebSocketServer, executeTerminalOnDockerTask}
