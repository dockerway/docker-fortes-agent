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
                ws.dockerStream[json.wsId] = await getStreamFromContainerExec(json.containerId, json.terminalSelected)
                //Si no obtuve el stream genero error y retorno
                if (!ws.dockerStream[json.wsId]) {
                    console.error("DockerStream doesnt work")
                    return
                }
                //AL RECIBIR DATOS DEL CONTENEDOR LOS MANDO AL WS
                ws.dockerStream[json.wsId].on('data', (chunk) => {
                    console.log("CHUNK: ", chunk, chunk.toString())

                    function deleteDockerHeaders(chunk) {

                        let headersIndex = chunk.indexOf('01000000', 0, 'hex')
                        let initialHeadersHadBeenDeleted = false
                        let chunkHasNoHeaders = false
                        let trimmeredChunkArray = []

                        while (!chunkHasNoHeaders) { //chequear headers -> guardar todo lo precedente asi como lo procedente a ellos -> goto 1
                            if (headersIndex == -1) {
                                chunkHasNoHeaders = true
                                break
                            }
                            
                            console.log(`Inside While loop | headersindex: '${headersIndex}'`)

                            if (initialHeadersHadBeenDeleted) { // se eliminaron los headers del inicio
                                console.log('initialHeadersHadBeenDeleted')
                                for (let index = 0; index < headersIndex; index++) {
                                    trimmeredChunkArray.push(chunk[index])
                                    console.log(trimmeredChunkArray)
                                }

                                chunk = chunk.subarray(headersIndex + 8)
                                headersIndex = chunk.indexOf('01000000', 0, 'hex')
                            } else {
                                console.log('else')
                                chunk = chunk.subarray(headersIndex + 8)
                                initialHeadersHadBeenDeleted = true
                            }

                        }

                        console.log(trimmeredChunkArray)
                        const trimmeredChunk = Buffer.from(trimmeredChunkArray)
                        console.log(trimmeredChunk)

                        return trimmeredChunk
                    }

                    function showBuffer(chunk) {
                        for (let index = 0; index < chunk.length; index++) {
                            console.log(chunk[index])
                        }
                    }

                    showBuffer(chunk)

                    chunk = deleteDockerHeaders(chunk)
                    console.log("CHUNK with no headers: ", chunk, chunk.toString())

                    const terminalMessage = { wsId: json.wsId, containerId: json.containerId, payload: chunk.toString() }
                    // console.log('WS SEND',terminalMessage)
                    ws.send(JSON.stringify(terminalMessage))
                })
            }
            //ESCRIBO LOS DATOS RECIBIDOS POR EL WS EN EL DOCKER STREAM
            if (ws.dockerStream[json.wsId]) {
                console.log('DockerStream write', json.payload);
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
            reject(error)
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

            exec.start({ stdin: true, stdout: true, stderr: true }, (error, stream) => {
                if (error) handle(error)

                resolve(stream)
            })

        })

    })


}

module.exports = startWebSocketServerWithDocker
