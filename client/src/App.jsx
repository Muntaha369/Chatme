//Trim your mustache
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UserList from './component/UserList'; 
import { multiSocket } from './store/store'; 
import { useReciverId } from './store/store'; 
import { useDataroom } from './store/store'; 
import { UserPlus } from 'lucide-react'; 
import { verifyToken } from './component/verify';
import { useNavigate } from 'react-router-dom';
import { useUser } from './store/store';
import { useUserID } from './store/store';
import { useReceiver } from './store/store';
import axios from 'axios';

// The socket connection should be established outside the component
const socket = io.connect('http://localhost:3002');


const App = () => {

  const navigate = useNavigate();

  const { user, setUser } = useUser();
  const { socketID } = useReciverId(); 
  const { setDataRoom } = useDataroom();
  const { setSockets } = multiSocket();
  const { setUserID } = useUserID();
  const [message, setMessage] = useState('');
  const [clientId, setId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([])
  const [newUserId, setNewUserId] = useState('');
  const [sender, setSender] = useState('')
  const {receiverName} = useReceiver()
  
  

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
      const allmessage = data.map((val)=>val)
      setChatHistory(allmessage)
      console.log("chats",allmessage);
      console.log("this the history",chatHistory)
    }

    
    const receiveMessageHandler = (data) => {
      setMessages((prevMessages) => [data, ...prevMessages]);
      console.log('Received message:', data.message);
    };
    
    const roomReceiveMessageHandler = (data) => {
      setMessages((prevMessages) => [data, ...prevMessages]);
      console.log("Received room message:", data.message);
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
    
    socket.emit("send_username",user);
    socket.on('hello', handleHello);
    socket.on('emitNewlyJoined', handleEmitall)
    socket.on('previousFRnewSock',handlePreFRnewSock)
    socket.on("all_userData", handleUserData)
    socket.on("Chat_history", handleChathistory)
    socket.on('receive_message', receiveMessageHandler);
    socket.on('room_receive_message', roomReceiveMessageHandler); 
    socket.on('room_invitation', handleRoomInvitation)

    return () => {
      socket.off('hello',handleHello);
      socket.off('emitNewlyJoined',handleEmitall);
      socket.off("all_userData",handleUserData); 
      socket.off("Chat_history",handleUserData); 
      socket.off('receive_message', receiveMessageHandler);
      socket.off('room_receive_message', roomReceiveMessageHandler); 
      socket.off('room_invitation',handleRoomInvitation);
    };
  }, [setSockets, setDataRoom, user]); 


  const messageEmitter = async(e) => {
    e.preventDefault();
    
    const currentRecipient = socketID; 

    if (currentRecipient && currentRecipient.trim() !== '') {
      if (message.trim()) {
        const newMessage = { Id: clientId, message: message.trim(), reciverId: currentRecipient.trim() };
        const payload = {
          senderId:sender, 
          receiverId:targetReceiver, 
          messageText:message.trim(), 
          messageType:currentRecipient.includes('+room') ? 'room' : 'private'
        }
        socket.emit('send_message', newMessage);
        console.log('EMIT:', newMessage);
        console.log("this is", sender, targetReceiver, newMessage.message)
        await axios.post('http://localhost:3002/api/all/addMessage', payload)
        
        if(currentRecipient.includes('+room')){
          setMessages((prevMessages)=>[...prevMessages])
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


  const currentChatMessages = messages.toReversed()
    .filter(msg => {
      const currentRecipient = socketID;

      const isMyMessageToTarget = msg.Id === clientId && msg.reciverId === currentRecipient;
      const isMessageFromTarget = msg.Id === currentRecipient && msg.reciverId === clientId;
      const isRoomMessageToCurrentRoom = msg.reciverId === currentRecipient; 

      if (currentRecipient && currentRecipient.includes('+room')) {
          return isRoomMessageToCurrentRoom;
      }
      
      return isMyMessageToTarget || isMessageFromTarget;
    })
    .slice() // Create a copy

    const targetReceiver = localStorage.getItem('reciver');

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className='h-full flex justify-center bg-gray-900 sm: w-[100%] md:w-[40%] lg:w-[30%]'><UserList/></div>
      <div className=' sm: w-[0%] md:w-[70%] h-full flex flex-col bg-gray-900 shadow-2xl overflow-hidden'>
        
        <header className='p-4 bg-gray-800 text-white shadow-md'>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className='text-xl font-bold'>Chat Client</h1>
              <p className='text-sm text-gray-400'>Your ID: <span className='font-mono text-green-400'>{clientId || 'Connecting...'}</span></p>
            </div>
            
            {socketID && (socketID.includes("+room") || socketID.includes("room")) && (
              <form onSubmit={handleNewuserSubmit} className='flex items-center gap-2'>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="User ID to Invite"
                  className='px-3 py-1 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 outline-none transition w-40'
                />
                <button
                  type='submit'
                  className='bg-indigo-600 text-white p-1 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md flex items-center'
                >
                  <UserPlus size={18} />
                </button>
              </form>
            )}

          </div>
        </header>

        {/* Message Display Area */}
        <div className='flex-1 p-4 space-y-4 overflow-y-auto flex flex-col'>
          
         {

          receiverName === targetReceiver &&

           chatHistory
           .filter((val) => 
              (val.senderId === sender && val.receiverId === targetReceiver) ||
             (val.senderId === targetReceiver && val.receiverId === sender)
           )
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
            const isRoom = msg.reciverId && (msg.reciverId.includes("+room") || msg.reciverId.includes("room"));
            
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
                    {isSender ? 'You' : `User: ${msg.Id}`} 
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
              Send to {targetReceiver}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;