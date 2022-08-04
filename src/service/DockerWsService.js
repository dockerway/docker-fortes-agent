const wsServer = require('../websocket-server')
const Docker = require("dockerode");


const startWebSocketServerWithDocker = () => {
    wsServer.on('connection', (ws) => {
        console.log("OnConnection clients size:", wsServer.clients.size)
        ws.on('message', async (data) => {
            let json = JSON.parse(data.toString()) // {wsId: zz, containerId: xx, payload: yy }

            if (!ws.dockerStream) {
                ws.dockerStream = {}
            }

            //INICIALIZO EL DOCKER STREAM SI NO EXISTE, UNO POR CADA CONTENEDOR DIFERENTE
            if (!ws.dockerStream[json.wsId]) {
                //OBTENGO EL STREAM
                ws.dockerStream[json.wsId] = await getStreamFromContainerExec(json.containerId, 'bash')
                //Si no obtube el stream genero error y retorno
                if(!ws.dockerStream[json.wsId]){
                    console.error("DockerStream doesnt work")
                    return
                }
                //AL RECIBIR DATOS DEL CONTENEDOR LOS MANDO AL WS
                ws.dockerStream[json.wsId].on('data', (chunk) => {
                    const terminalMessage = {wsId: json.wsId, containerId: json.containerId, payload: chunk.toString()}
                    //console.log('WS SEND',terminalMessage)
                    ws.send(JSON.stringify(terminalMessage))
                })
            }
            //ESCRIBO LOS DATOS RECIBIDOS POR EL WS EN EL DOCKER STREAM
            if(ws.dockerStream[json.wsId]){
                //console.log('DockerStream write',json.payload);
                ws.dockerStream[json.wsId].write(json.payload);
            }


        })
    })
}

const getStreamFromContainerExec = (containerID, terminal = 'bash') => {

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

module.exports = startWebSocketServerWithDocker
