import { webSocketServer } from '../websocket-server.js';
import Docker from 'dockerode';


async function getStreamFromContainerExec(containerID, terminal = 'bash') {
    try {
        const dockerInstance = new Docker()
        const selectedContainer = dockerInstance.getContainer(containerID)

        console.log(`selectedContainer: ${JSON.stringify(selectedContainer)}`)

        const executionParameters = {
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Cmd: [`${terminal}`],
            interactive: true,
            tty: true
        }

        selectedContainer.exec(executionParameters, (error, exec) => {
            if (error) throw error

            exec.start({ stdin: true, stdout: true, stderr: true }, (error, stream) => {
                if (error) throw error

                console.log(`stream: ${JSON.stringify(stream)}`)

                return stream
            })
        })
    } catch (error) {
        console.error(`An error happened at the getStreamFromContainerExec function: '${error}'`)
        throw (error)
    }
}

export const startWebSocketServerWithDocker = () => {
    webSocketServer.on('connection', (ws) => {
        console.log("OnConnection clients size:", webSocketServer.clients.size)
        ws.on('message', async (data) => {
            const json = JSON.parse(data.toString()) // {wsId: zz, containerId: xx, payload: yy }
            console.log(`ws json data: '${JSON.stringify(json)}'`)
            //INICIALIZO EL DOCKER STREAM SI NO EXISTE, UNO POR CADA CONTENEDOR DIFERENTE
            if (!ws.dockerStream) ws.dockerStream = {}


            if (!ws.dockerStream[json.wsId]) {
                //OBTENGO EL STREAM
                const containerStream = await getStreamFromContainerExec(json.containerId, json.terminalSelected)
                ws.dockerStream[json.wsId] = containerStream


                if (!ws.dockerStream[json.wsId]) {
                    const error = `An error happenened when we tried to obtain the docker stream of the ${json.containerId}'s container | containerStream value: '${containerStream}'`

                    console.error(error)
                    throw new Error(error)
                }

                //AL RECIBIR DATOS DEL CONTENEDOR LOS MANDO AL WS
                ws.dockerStream[json.wsId].on('data', (chunk) => {

                    function deleteDockerHeaders(chunk) {

                        function chunkIndexIsInsideDockerHeadersRange(chunkIndex) {
                            let result

                            for (let dockerHeaderIndex = 0; dockerHeaderIndex < dockerHeaderIndexes.length; dockerHeaderIndex++) {
                                result = (chunkIndex >= dockerHeaderIndexes[dockerHeaderIndex].start && chunkIndex <= dockerHeaderIndexes[dockerHeaderIndex].end)
                                if (result === true) break
                            }

                            return result
                        }

                        const dockerHeaderIndexes = []
                        const trimmeredChunkArray = []

                        let chunkDockerHeaderSearchIndex = 0
                        let dockerHeadersIndex = chunk.indexOf('01000000', chunkDockerHeaderSearchIndex, 'hex')

                        let allDockerHeadersFromChunkWereDetected = false

                        while (allDockerHeadersFromChunkWereDetected == false) {
                            if (dockerHeadersIndex === -1) {
                                allDockerHeadersFromChunkWereDetected = true

                            } else {
                                dockerHeaderIndexes.push({ start: dockerHeadersIndex, end: (dockerHeadersIndex + 7) })

                                dockerHeadersIndex = chunk.indexOf('01000000', chunkDockerHeaderSearchIndex, 'hex')
                                chunkDockerHeaderSearchIndex = (dockerHeadersIndex + 7)
                            }
                        }

                        for (let index = 0; index < chunk.length; index++) {
                            if (chunkIndexIsInsideDockerHeadersRange(index)) {
                                continue
                            } else {
                                trimmeredChunkArray.push(chunk[index])
                            }
                        }

                        return Buffer.from(trimmeredChunkArray)
                    }

                    chunk = deleteDockerHeaders(chunk)

                    const terminalMessage = { wsId: json.wsId, containerId: json.containerId, payload: chunk.toString() }
                    ws.send(JSON.stringify(terminalMessage))
                })
            }
            //ESCRIBO LOS DATOS RECIBIDOS POR EL WS EN EL DOCKER STREAM
            if (ws.dockerStream[json.wsId]) {
                console.log('DockerStream write', json.payload)
                ws.dockerStream[json.wsId].write(json.payload)
            }
        })
    })
}


