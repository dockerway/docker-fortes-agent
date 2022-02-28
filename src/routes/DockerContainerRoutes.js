const express = require('express')
const {containerStats} = require('../service/ContainerService')
const router = express.Router()


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

module.exports = router
