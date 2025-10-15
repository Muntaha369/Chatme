const express = require('express');
const app = express()
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async(socket) => {
  console.log(`USER CONNECTED: ${socket.id}`);
  const allSockets = await io.fetchSockets();
  const allSocketsid = allSockets.map(s=>s.id)
  console.log('Other sockets : ', allSocketsid)
  
  socket.emit("hello", socket.id);
  io.emit("emitall",allSocketsid)

  socket.on("send_message", (data) => {
    console.log(`SERVER RECEIVED from ${data.Id}: ${data.message}`);
    let ID = data.reciverId;
    if(ID.includes('+room')){
      console.log('ITS A ROOM ID', ID)
    }
    else{
    socket.to(data.reciverId).emit("receive_message", data);}
  });



  socket.on("disconnect", () => {
    console.log(`USER DISCONNECTED: ${socket.id}`);
    setTimeout(async () => {
            const remainingSockets = await io.fetchSockets();
            const remainingUserIds = remainingSockets.map(s => s.id);
            // Send the reduced list to everyone
            io.emit("emitall", remainingUserIds);
        }, 500)
  });
});

server.listen(3002, () => console.log("Server is running on port 3002"));
