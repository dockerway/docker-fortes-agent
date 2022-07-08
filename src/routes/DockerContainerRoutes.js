const http = require("http");

const express = require('express')
const { containerStats , foldersCreator, runTerminalOnContainer } = require('../service/ContainerService')
const router = express.Router()

function validateStatusCode(statusCode){
    return http.STATUS_CODES.hasOwnProperty(statusCode)
}

router.get('/docker/container/:contianerid/stats', async function (req, res) {
    try {
        let r = await containerStats(req.params.contianerid)
        res.json(r)
    } catch (e) {
        let statusCode = (e.statusCode && validateStatusCode(e.statusCode)) ? e.statusCode : 500
        res.status(statusCode)
        res.send(e.message)
    }
})

router.post('/docker/container/:containerid/runterminal', async function (req, res) {
    try {
        const response = await runTerminalOnContainer(req.params.containerid);
        res.send(response);
    } catch (error) {
        const statusCode = (error.statusCode && validateStatusCode(error.statusCode)) ? error.statusCode : 500;
        res.status(statusCode);
        res.send(error.message);
    }
})

router.post('/docker/folders', async function (req, res){
    try {
        let r = await foldersCreator(req.body)
        res.status(200)
        res.json({response: r})
    } catch(e){       
        let statusCode = (e.statusCode && validateStatusCode(e.statusCode)) ? e.statusCode : 500
        res.status(statusCode)
        res.send(e.message)
    }
})

module.exports = router
