const express = require('express')
const DockerContainerRoutes = require('./routes/DockerContainerRoutes')
const ErrorHandlerMiddleware = require('./middlewares/ErrorHandlerMiddleware')
const app = express()


app.use('/api',DockerContainerRoutes)
app.use(ErrorHandlerMiddleware)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Started app on port: " + PORT)
})
