const Message = require('../models/chatModel')

module.exports = async (socket, io)=>{
    // console.log(`USER CONNECTED: ${socket.id}`);
  const allSockets = await io.fetchSockets();
  const allSocketsid = allSockets.map(s=>s.id)
  console.log('Other sockets : ', allSocketsid)
  
  
  socket.on("send_username", async(data)=>{
    socket.emit("hello", socket.id);
    io.emit("emitNewlyJoined", {data, socketId:socket.id})
    console.log("This one is the one",data);
    io.emit("all_userData", data);
    const Chats = await Message.find({
        $or: [
            { senderId: data },
            { receiverId: data }
        ]
    }).sort({ timestamp: 1 })
    // console.log("This are the chats",Chats)
    socket.emit("Chat_history",Chats)
  })

  socket.on("emitOldtoNewlyJoined",(data)=>{
    socket.to(data.receiver).emit("previousFRnewSock",{user:data.user, previousSock:data.previousSock})
  })

  // Sending message
  socket.on("send_message", (data) => {
    console.log(`SERVER RECEIVED from`,data);
    let ID = data.reciverId;
    // console.log(ID)
    if(ID.includes('+room')){
      console.log("going throung",data)

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

  socket.on("room_reqInitial",(data)=>{
    // const roomParticipants = data.participants
    // const room = data.roomName
    socket.join(data.roomName)
    io.emit("room_invitationInitial", data)
  })

  socket.on("Room_List",(data)=>{
    data.map((val)=>{
      console.log("This are all room that needed to be joined",val)
      socket.join(val)
    })
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