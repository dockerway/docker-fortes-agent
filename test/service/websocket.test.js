const {expect} = require('chai')
const {WebSocket} = require('ws');

describe("WebSocketService", () => {


    beforeEach(async () => {

    })


    it('WebSocket Connection', async () => {
        const WSS_URL = 'ws://localhost:4000'
        console.log("STARTING")


        let p1 = new Promise((resolve, reject) => {
            //WS1
            let ws1 = new WebSocket(WSS_URL)
            let json = JSON.stringify({containerId: 'fdde4f9820ad', payload: 'ls -l\n'})
            ws1.on('open', () => {
                console.log("WS1 OPEN")
                ws1.send(json)
                ws1.onmessage = ({data}) => {
                    console.log("WS1 MSG RECEIVED:",data.toString())
                    resolve()
                }

            })

            ws1.on('close', () => reject())

        })


        //WS2
        let p2 = new Promise((resolve, reject) => {
            let ws2 = new WebSocket(WSS_URL)
            let json = JSON.stringify({containerId: 'db4c7776986d', payload: 'Hola ws2'})
            ws2.on('open', () => {
                console.log("WS2 OPEN")
                ws2.send(json)
                resolve()
            })

            ws2.on('close', () => reject())
        })

        await Promise.all([p1])

        console.log("Todas las promesas terminaron")


        expect(true).equal(true)
    })

})
