//Trim your mustache
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UserList from './component/UserList'; 
import { multiSocket, useRoom, useOpen } from './store/store'; 
import { useReciverId } from './store/store'; 
import { useDataroom } from './store/store'; 
import { Menu } from 'lucide-react'; 
import { verifyToken } from './component/verify';
import { useNavigate } from 'react-router-dom';
import { useUser } from './store/store';
import { useUserID } from './store/store';
import { useReceiver } from './store/store';
import axios from 'axios';
import SlideAnimations from './component/Slider';
// The socket connection should be established outside the component
const socket = io.connect('http://localhost:3002');


const App = () => {

  const navigate = useNavigate();

  const { user, setUser } = useUser();
  const { socketID } = useReciverId(); 
  const { setDataRoom } = useDataroom();
  const { setSockets } = multiSocket();
  const { setUserID } = useUserID();
  const { receiverName } = useReceiver()
  const { RoomList } = useRoom()
  const { setOpen } = useOpen()

  const [message, setMessage] = useState('');
  const [clientId, setId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([])
  const [newUserId, setNewUserId] = useState('');
  const [sender, setSender] = useState('')
  
  

  useEffect(()=>{console.log("sender is set")},[sender])

  useEffect(() => {

    // this is token verification logic
    const checkAuth = async()=>{
      const res = await verifyToken()

      if(res && res.success){
        // console.log("hip hip hoorray !!")
        setUser(res.message2)
        localStorage.setItem('email',res.message)
        console.log("this is me",res.message2)
        console.log("res",res)
        setSender(res.message2)

      }else{
        console.log(res.success)
        console.log(res.message)
        localStorage.removeItem('authToken');
        navigate('/login')
      }
    }
    checkAuth()
    console.log(user)

    const handleHello = (arg) => {
      setId(arg);
      setUserID(arg)
      console.log("this is socket id",socket.id)
    }

    const handleEmitall = (data) => {
      setSockets(data);
      console.log(data)
      socket.emit("emitOldtoNewlyJoined",{user, previousSock:socket.id, receiver:data.socketId})
    }

    const handleUserData = (data)=>{
      console.log("FROM 65",data)
    }

    const handleChathistory = (data)=>{
      const allonetoneChats = data.Chats.map((val)=>val)
      // setChatHistory(allonetoneChats)
      console.log("chats",data);
      const newArr = data.roomChats.flat()
      const saveArr = [...allonetoneChats, ...newArr]
      setChatHistory(saveArr)
      // console.log("roomChat", saveArr)
      // console.log("this the history",chatHistory)
    }

    
    const receiveMessageHandler = (data) => {
      setMessages((prevMessages) => [data, ...prevMessages]);
      console.log('Received message:', data);
    };
    
    const roomReceiveMessageHandler = (data) => {
      setMessages((prevMessages) => [data, ...prevMessages]);
      console.log("Received room message:", data);
    };

    const handleRoomInvitation = (data) => {
      console.log("From invitation", data);
      socket.emit("join_room", data.roomName); 
      setDataRoom(data.roomName); 
    }

    const handlePreFRnewSock=(data)=>{
      const change = {data:data.user, socketId:data.previousSock};
      setSockets(change);
      console.log("ThreewayHandshake", data);
    }

    const handleInitialInvitation = (data)=>{
      const allParticipants = data.participants;
      // console.log("This are all participants", user)
      const exists = allParticipants.find((val)=>val === user)
      if(exists){
        setDataRoom(data.roomName)
        socket.emit("join_room", data.roomName); 
        console.log("You are the part",user);
      }else{
        console.log("sorry you are beta",user)
      }
    }
    
    socket.emit("send_username",{user, RoomList});
    socket.on('hello', handleHello);
    socket.on('emitNewlyJoined', handleEmitall)
    socket.on('previousFRnewSock',handlePreFRnewSock)
    socket.on("all_userData", handleUserData)
    socket.on("Chat_history", handleChathistory)
    socket.on('receive_message', receiveMessageHandler);
    socket.on('room_receive_message', roomReceiveMessageHandler); 
    socket.on('room_invitation', handleRoomInvitation);
    socket.on('room_invitationInitial',handleInitialInvitation);

    return () => {
      socket.off('hello',handleHello);
      socket.off('emitNewlyJoined',handleEmitall);
      socket.off('previousFRnewSock',handlePreFRnewSock)
      socket.off("all_userData",handleUserData); 
      socket.off("Chat_history",handleUserData); 
      socket.off('receive_message', receiveMessageHandler);
      socket.off('room_receive_message', roomReceiveMessageHandler); 
      socket.off('room_invitation',handleRoomInvitation);
      socket.off('room_invitationInitial',handleInitialInvitation);
    };
  }, [setSockets, setDataRoom, user]); 


  const messageEmitter = async(e) => {
    e.preventDefault();
    
    const currentRecipient = socketID; 
    console.log("this i the type",socketID)

    if (currentRecipient && currentRecipient.trim() !== '') {
      if (message.trim()) {
        const newMessage = { Id: clientId, message: message.trim(), reciverId: currentRecipient.trim(), senderName:user };
        const payload = {
          senderId:sender, 
          receiverId:receiverName, 
          messageText:message.trim(), 
          messageType:currentRecipient.includes('+room') ? 'room' : 'private'
        }
        // console.log("Damming",user)
        socket.emit('send_message', newMessage);
        console.log('EMIT:', newMessage);
        console.log("this is", sender, receiverName, newMessage.message)
        await axios.post('http://localhost:3002/api/all/addMessage', payload)
        
        if(currentRecipient.includes('+room')){
          console.log("message is set")
          setMessages((prevMessages)=>[...prevMessages]);
        }
        else{
          setMessages((prevMessages) => [newMessage, ...prevMessages]);
          setMessage('');} 
      }
    } else {
      alert("Please select a user or chat room to send a message.");
    }
  };

  const handleNewuserSubmit = (e) => {
    e.preventDefault();
    const data = { reciverId: newUserId.trim(), roomName: socketID.trim(), senderId: clientId };
    
    if (!socketID.includes("+room")) {
        alert("Please select a valid chat room before inviting a user.");
        return;
    }
    socket.emit('room_req', data);
    setNewUserId('');
  };

  const handleRoomJoin = (participants, newRoomName) =>{
    const data = { participants, roomName: newRoomName.trim(), senderId: clientId }; 

        if (!newRoomName.includes("+room")) {
        alert("Please select a valid chat room before inviting a user.");
        return;
    }

    socket.emit('room_reqInitial', data);
    // console.log("this is the val", participants)
    
  }

  const currentChatMessages = messages.toReversed()
    .filter(msg => {
      const currentRecipient = socketID;
      console.log("msg", msg.Id, "clientId", clientId, "reciver", msg.reciverId, "currentreci", currentRecipient)
      const isMyMessageToTarget = msg.Id === clientId && msg.reciverId === currentRecipient;
      const isMessageFromTarget = msg.Id === currentRecipient && msg.reciverId === clientId;
      const isRoomMessageToCurrentRoom = msg.reciverId === currentRecipient; 

      if (currentRecipient && currentRecipient.includes('+room')) {
          return isRoomMessageToCurrentRoom;
      }
      
      return isMyMessageToTarget || isMessageFromTarget;
    })
    .slice() // Create a copy

  const SyncedMessage = chatHistory.filter(msg=>{
    const isMyMessageToTarget = (msg.senderId === sender && msg.receiverId === receiverName) 
    const isMessageFromTarget = msg.senderId === receiverName && msg.receiverId === sender;
    const isRoomMessageToCurrentRoom = msg.receiverId === receiverName; 

    if(receiverName && receiverName.includes('+room')){
      return isRoomMessageToCurrentRoom;
    }

      return isMyMessageToTarget || isMessageFromTarget;
  }).slice()

    // const targetReceiver = localStorage.getItem('reciver');

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className='h-full flex justify-center bg-gray-900 sm: w-[100%] md:w-[40%] lg:w-[30%]'>
        <SlideAnimations/>
        <UserList socket={socket} roomJoin = {handleRoomJoin} /></div>
      <div className=' sm: w-[0%] md:w-[70%] h-full flex flex-col bg-gray-900 shadow-2xl overflow-hidden'>
        
        <header className='p-4 bg-gray-800 text-white shadow-md'>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className='text-xl font-bold'>Chat Client</h1>
              <p className='text-sm text-gray-400'>Your ID: <span className='font-mono text-green-400'>{clientId || 'Connecting...'}</span></p>
            </div>
            
            {socketID && (socketID.includes("+room") || socketID.includes("room")) && (
              <>
                <button
                  onClick={()=>setOpen(true)}
                  className='bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md flex items-center'
                >
                  <Menu size={18} />
                </button>
              </>
            )}

          </div>
        </header>

        {/* Message Display Area */}
        <div className='flex-1 p-4 space-y-4 overflow-y-auto flex flex-col'>
          
         {

          // receiverName === targetReceiver &&

           SyncedMessage
          .map((val, idx) => {
            // Check if I am the sender
            // console.log("This is sender",sender,"This is val sender", val.senderId, "This is targetReceiver" , targetReceiver,"This is val receiver", val.reciverId)
            const isMe = val.senderId === sender;

            return (
              <div
                // Use val._id if available, otherwise idx
                key={idx} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-white shadow-md ${
                    isMe 
                      ? 'bg-indigo-600 rounded-br-sm' // My messages (Purple)
                      : 'bg-gray-600 rounded-tl-sm'   // Their messages (Gray)
                  }`}
                >
                  <p className='font-bold text-xs opacity-80 mb-1'>
                    {/* 3. LOGIC FIX: If it's not me, show the SENDER'S name, not the receiver's */}
                    {isMe ? 'You' : val.senderId} 
                    
                    {/* {isRoom && (
                      <span className='ml-2 text-yellow-300 font-normal'>
                        (Room)
                      </span>
                    )} */}
                  </p>
                  <p className='break-words text-sm'>{val.messageText}</p>
                </div>
              </div>
            );
          })}
          {currentChatMessages.map((msg, index) => {

            const isSender = msg.Id === clientId;
            console.log(msg)
            const isRoom = msg.reciverId && (msg.reciverId.includes("+room") || msg.reciverId.includes("room"));
            console.log(isRoom)
            return (
              <div
                key={index}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-white shadow-md ${
                    isSender ? 'bg-indigo-600 rounded-br-sm' : 'bg-gray-600 rounded-tl-sm'
                  }`}
                >
                  <p className='font-bold text-xs opacity-80 mb-1'>
                    {/* Display sender's ID, and note if it's a room */}
                    {/* why the below line is not working ? when its not room it should not render */}
                    { isRoom && (isSender ? 'You' : `User: ${msg.senderName}`)}
                    { !isRoom &&(isSender ? 'You' : `User: ${receiverName}`)} 
                    {isRoom && (
                        <span className='ml-2 text-yellow-300 font-normal'>
                            (Room)
                        </span>
                    )}
                  </p>
                  <p className='break-words text-sm'>{msg.message}</p> 
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <div className='p-4 border-t border-gray-200'>
          <form onSubmit={messageEmitter} className='flex gap-2'>
            <input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              className='flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition'
              type='text'
              placeholder='Type your message...'
            />
            {/* The recipient ID is now SELECTED from the UserList (socketID) */}
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md'
            >
              Send to {receiverName}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;