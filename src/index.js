const express = require('express')
const DockerContainerRoutes = require('./routes/DockerContainerRoutes')

const app = express()


app.use('/api',DockerContainerRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Started app on port: " + PORT)
})
