const http = require("http");

const express = require('express');
const { containerStats , foldersCreator, runTerminalOnContainer } = require('../service/ContainerService');
const router = express.Router();

function validateStatusCode(statusCode){
    return http.STATUS_CODES.hasOwnProperty(statusCode)
}

router.get('/docker/container/:containerid/stats', async function (req, res) {
    try {
        const response = await containerStats(req.params.containerid)
        res.json(response)
    } catch (error) {
        const statusCode = (error.statusCode && validateStatusCode(error.statusCode)) ? error.statusCode : 500

        res.status(statusCode)
        res.send(error.message)
    }
})


router.post('/docker/folders', function (req, res){
    try {
        if (!Array.isArray(req.body)) throw new Error("Request body must be an Array!")
        const response = foldersCreator(req.body)

        console.log(`request body: ${JSON.stringify(req.body)}`)
        console.log(`response from folders endpoint: ${JSON.stringify(response)}`)

        res.status(200)
        res.json({response: response})

    } catch(error){
        const statusCode = (error.statusCode && validateStatusCode(error.statusCode)) ? error.statusCode : 500

        res.status(statusCode)
        res.send(error.message)
    }
})

module.exports = router;
