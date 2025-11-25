const Message = require('../models/chatModel')

module.exports = async (socket, io)=>{
    // console.log(`USER CONNECTED: ${socket.id}`);
  const allSockets = await io.fetchSockets();
  const allSocketsid = allSockets.map(s=>s.id)
  console.log('Other sockets : ', allSocketsid)
  
  socket.emit("hello", socket.id);
  io.emit("emitall",allSocketsid)

  socket.on("send_username", async(data)=>{
    console.log("This one is the one",data);
    io.emit("all_userData", data);
    const Chats = await Message.find({
        $or: [
            { senderId: data },
            { receiverId: data }
        ]
    }).sort({ timestamp: 1 })
    console.log("This are the chats",Chats)
    socket.emit("Chat_history",Chats)
  })

  // Sending message
  socket.on("send_message", (data) => {
    console.log(`SERVER RECEIVED from`,data);
    let ID = data.reciverId;
    if(ID.includes('+room')){
      console.log("going throung",data.reciverId)

      // Which room to recive
      io.to(data.reciverId).emit("room_receive_message",data)
    }
    else{
      console.log("-room")
      // which socket to recieve
    socket.to(data.reciverId).emit("receive_message", data);}
  });

  // adding user to room
  socket.on("room_req",(data)=>{
    console.log("request to join room",data)
    socket.join(data.roomName)
    // creator joining a room
    socket.to(data.reciverId).emit("room_invitation",data)
  })

  // other user joining a room
  socket.on("join_room",(data)=>{
    socket.join(data)
  })

  socket.on("disconnect", () => {
    console.log(`USER DISCONNECTED: ${socket.id}`);
    setTimeout(async () => {
            const remainingSockets = await io.fetchSockets();
            const remainingUserIds = remainingSockets.map(s => s.id);
            // Send the reduced list to everyone
            io.emit("emitall", remainingUserIds);
        }, 500)
  });
}