const { Server } = require('socket.io')
const handleOperation = require('./operation')

const socketInit = (server)=>{
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection",async(socket)=>{
    handleOperation(socket,io)
  });
}

module.exports = {socketInit}

