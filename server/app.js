const express = require('express');
const app = express()
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`USER CONNECTED: ${socket.id}`);
  
  socket.emit("hello", socket.id);

  socket.on("send_message", (data) => {
    console.log(`SERVER RECEIVED from ${data.Id}: ${data.message}`);
    
    socket.broadcast.emit("receive_message", data);
  });


  socket.on("disconnect", () => {
    console.log(`USER DISCONNECTED: ${socket.id}`);
  });
});

server.listen(3002, () => console.log("Server is running on port 3002"));
