const express = require('express');
const app = express()
const cors = require('cors')
const http = require('http')
const { socketInit } = require('./sockets/index');

app.use(cors())

const server = http.createServer(app);

socketInit(server)


server.listen(3002, () => console.log("Server is running on port 3002"));