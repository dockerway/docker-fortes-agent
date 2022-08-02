function startWebSocketServer(){
    const { WebSocketServer } = require('ws');
    const webSocketServer = new WebSocketServer({ port:  process.env.WSSPORT ? process.env.WSSPORT : 9997});

    return webSocketServer;
}

function executeTerminalOnDockerTask(containerID, terminal, webSocketServer){
    const Docker = require('dockerode');

    webSocketServer.on('connection', (ws) => {
        console.log("Connection Made!");

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

                        console.log(`message received: '${data.payload}'`);
                        console.log(`message containerID received: '${data.containerId}'`);

                        if(data.containerId == containerID){
                            stream.write(data.payload);
                        }
                    }; //write to container terminal

                    stream.on('data', (chunk) => {
                        const terminalMessage = {
                            containerId:containerID,
                            payload: chunk.toString()
                        };

                        ws.send(JSON.stringify(terminalMessage));
                    }); //send to client
                }
            );
        });
    });
}

module.exports = {startWebSocketServer, executeTerminalOnDockerTask}