const http = require("http");

const express = require('express')
const { containerStats , foldersCreator } = require('../service/ContainerService')
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

router.post('/docker/folders', async function (req, res){
    try {
        let r = await foldersCreator(req.body)
        res.send("Folder created successfully!")
        res.json(r)
    } catch(e){       
        let statusCode = (e.statusCode && validateStatusCode(e.statusCode)) ? e.statusCode : 500
        res.status(statusCode)
        res.send(e.message)
    }
})

module.exports = router
