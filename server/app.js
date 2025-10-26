const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const { socketInit } = require('./sockets/index');
const ConnectDb = require('./db/db');
const useRouter = require('./routes/router')

app.use(express.json()); 
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
}));

const server = http.createServer(app);



app.use('/api/auth',useRouter)

socketInit(server);

ConnectDb().then(() => {
    server.listen(3002, () => console.log("Server is running on port 3002"));
}).catch((error) => {
    console.error("Failed to start server due to DB connection error:", error);
    process.exit(1);
});


// Trying things out

//nothing much