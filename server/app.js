const express = require('express');
const app = express()
const cors = require('cors')
const http = require('http')
const { socketInit } = require('./sockets/index');
const ConnectDb = require('./db/db')

app.use(cors())

const server = http.createServer(app);

socketInit(server)

ConnectDb().then(()=>server.listen(3002, () => console.log("Server is running on port 3002")))
