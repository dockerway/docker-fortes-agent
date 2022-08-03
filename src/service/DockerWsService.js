const wsServer = require('../websocket-server')
const Docker = require("dockerode");


const initializeWebSocketServer = () => {
    wsServer.on('connection', (ws) => {
        console.log("OnConnection clients size:", wsServer.clients.size)
        ws.on('message', async (data) => {
            let json = JSON.parse(data.toString()) // {containerId: xx, payload: yy }

            //INICIALIZO EL ID SI NO EXISTE
            if (!ws.id) {
                ws.id = json.containerId
            }
            //INICIALIZO EL DOCKER STREAM SI NO EXISTE
            if (!ws.dockerStream) {
                //OBTENGO EL STREAM
                ws.dockerStream = await syncContainerExec(json.containerId, 'bash')
                //Si no obtube el stream genero error y retorno
                if(!ws.dockerStream){
                    console.error("DockerStream doesnt work")
                    return
                }
                //AL RECIBIR DATOS DEL CONTENEDOR LOS MANDO AL WS
                ws.dockerStream.on('data', (chunk) => {
                    const terminalMessage = {containerId: json.containerId, payload: chunk.toString()}
                    console.log(`WS SEND CONTAINERID: '${terminalMessage.containerId}'| PAYLOAD: '${terminalMessage.payload}'`);
                    ws.send(JSON.stringify(terminalMessage));
                })
            }
            //ESCRIBO LOS DATOS RECIBIDOS POR EL WS EN EL DOCKER STREAM
            if(ws.dockerStream){
                console.log(`DockerStream WRITE CONTAINERID: '${terminalMessage.containerId}'| PAYLOAD: '${terminalMessage.payload}'`);
                ws.dockerStream.write(json.payload);
            }


        })
    })
}

const syncContainerExec = (containerID, terminal = 'bash') => {

    return new Promise((resolve, reject) => {
        const dockerInstance = new Docker();
        const selectedContainer = dockerInstance.getContainer(containerID);

        function handle(error) {
            console.error("HANDLE ERROR", error);
        }

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

            exec.start({stdin: true, stdout: true, stderr: true}, (error, stream) => {
                if (error) handle(error)

                resolve(stream)
            })

        })

    })


}

module.exports = initializeWebSocketServer
