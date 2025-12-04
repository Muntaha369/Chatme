import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UserList from './component/UserList';
import { Menu, Send } from 'lucide-react'; // Added Send icon
import { verifyToken } from './component/verify';
import { useNavigate } from 'react-router-dom';
import { multiSocket, useRoom, useOpen, useReciverId, useDataroom, useUser, useUserID, useReceiver } from './store/store';
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
  const { isOpen, setOpen } = useOpen()

  const [message, setMessage] = useState('');
  const [clientId, setId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([])
  const [newUserId, setNewUserId] = useState('');
  const [sender, setSender] = useState('')


  useEffect(() => { console.log("sender is set") }, [sender])

  useEffect(() => {

    // this is token verification logic
    const checkAuth = async () => {
      const res = await verifyToken()

      if (res && res.success) {
        // console.log("hip hip hoorray !!")
        setUser(res.message2)
        localStorage.setItem('email', res.message)
        console.log("this is me", res.message2)
        console.log("res", res)
        setSender(res.message2)

      } else {
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
      console.log("this is socket id", socket.id)
    }

    const handleEmitall = (data) => {
      setSockets(data);
      console.log(data)
      socket.emit("emitOldtoNewlyJoined", { user, previousSock: socket.id, receiver: data.socketId })
    }

    const handleUserData = (data) => {
      console.log("FROM 65", data)
    }

    const handleChathistory = (data) => {
      const allonetoneChats = data.Chats.map((val) => val)
      // setChatHistory(allonetoneChats)
      console.log("chats", data);
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

    const handlePreFRnewSock = (data) => {
      const change = { data: data.user, socketId: data.previousSock };
      setSockets(change);
      console.log("ThreewayHandshake", data);
    }

    const handleInitialInvitation = (data) => {
      const allParticipants = data.participants;
      // console.log("This are all participants", user)
      const exists = allParticipants.find((val) => val === user)
      if (exists) {
        setDataRoom(data.roomName)
        socket.emit("join_room", data.roomName);
        console.log("You are the part", user);
      } else {
        console.log("sorry you are beta", user)
      }
    }

    socket.emit("send_username", { user, RoomList });
    socket.on('hello', handleHello);
    socket.on('emitNewlyJoined', handleEmitall)
    socket.on('previousFRnewSock', handlePreFRnewSock)
    socket.on("all_userData", handleUserData)
    socket.on("Chat_history", handleChathistory)
    socket.on('receive_message', receiveMessageHandler);
    socket.on('room_receive_message', roomReceiveMessageHandler);
    socket.on('room_invitation', handleRoomInvitation);
    socket.on('room_invitationInitial', handleInitialInvitation);

    return () => {
      socket.off('hello', handleHello);
      socket.off('emitNewlyJoined', handleEmitall);
      socket.off('previousFRnewSock', handlePreFRnewSock)
      socket.off("all_userData", handleUserData);
      socket.off("Chat_history", handleUserData);
      socket.off('receive_message', receiveMessageHandler);
      socket.off('room_receive_message', roomReceiveMessageHandler);
      socket.off('room_invitation', handleRoomInvitation);
      socket.off('room_invitationInitial', handleInitialInvitation);
    };
  }, [setSockets, setDataRoom, user]);


  const messageEmitter = async (e) => {
    e.preventDefault();

    const currentRecipient = socketID;
    console.log("this i the type", socketID)

    if (currentRecipient && currentRecipient.trim() !== '') {
      if (message.trim()) {
        const newMessage = { Id: clientId, message: message.trim(), reciverId: currentRecipient.trim(), senderName: user };
        const payload = {
          senderId: sender,
          receiverId: receiverName,
          messageText: message.trim(),
          messageType: currentRecipient.includes('+room') ? 'room' : 'private'
        }
        // console.log("Damming",user)
        socket.emit('send_message', newMessage);
        console.log('EMIT:', newMessage);
        console.log("this is", sender, receiverName, newMessage.message)
        await axios.post('http://localhost:3002/api/all/addMessage', payload)

        if (currentRecipient.includes('+room')) {
          console.log("message is set")
          setMessages((prevMessages) => [...prevMessages]);
        }
        else {
          setMessages((prevMessages) => [newMessage, ...prevMessages]);
          setMessage('');
        }
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

  const handleRoomJoin = (participants, newRoomName) => {
    const data = { participants, roomName: newRoomName.trim(), senderId: clientId };

    if (!newRoomName.includes("+room")) {
      alert("Please select a valid chat room before inviting a user.");
      return;
    }

    socket.emit('room_reqInitial', data);
    // console.log("this is the val", participants)

  }

  const currentChatMessages = messages
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

  const SyncedMessage = chatHistory.toReversed().filter(msg => {
    const isMyMessageToTarget = (msg.senderId === sender && msg.receiverId === receiverName)
    const isMessageFromTarget = msg.senderId === receiverName && msg.receiverId === sender;
    const isRoomMessageToCurrentRoom = msg.receiverId === receiverName;

    if (receiverName && receiverName.includes('+room')) {
      return isRoomMessageToCurrentRoom;
    }

    return isMyMessageToTarget || isMessageFromTarget;
  }).slice()

  // const targetReceiver = localStorage.getItem('reciver');

  return (
    <div className='w-screen h-screen flex justify-center items-center bg-black overflow-hidden'>
      {/* Sidebar Area */}
      <div className='hidden md:flex h-full md:w-[35%] lg:w-[35%] xl:w-[30%] bg-gray-900 border-r border-gray-800/50 relative z-20'>
        <SlideAnimations />
        <UserList socket={socket} roomJoin={handleRoomJoin} />
      </div>

      {/* Main Chat Area */}
      <div className='w-full md:w-[65%] lg:w-[65%] xl:w-[70%] h-full flex flex-col bg-gray-900 shadow-2xl relative z-10'>

        {/* Header */}
        <header className='px-6 py-4 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 flex justify-between items-center sticky top-0 z-10'>
          <div className="flex flex-col gap-0.5">
            <h1 className='text-lg font-bold text-white tracking-tight'>
              {receiverName ? (receiverName.includes('+room') ? `Group: ${receiverName.replace('+room', '')}` : receiverName) : 'Select a Chat'}
            </h1>
            <div className='flex items-center gap-2'>
              <div className={`w-2 h-2 rounded-full ${clientId ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <p className='text-xs text-gray-400 font-mono'>
                ID: <span className='text-gray-300'>{clientId ? clientId.substring(0, 8) + '...' : 'Connecting...'}</span>
              </p>
            </div>
          </div>

          {socketID && (socketID.includes("+room") || socketID.includes("room")) && (
            <button
              onClick={() => setOpen(!isOpen)}
              className='bg-gray-800 text-gray-300 p-2.5 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200 shadow-sm border border-gray-700/50 active:scale-95'
              title="Room Info"
            >
              <Menu size={20} />
            </button>
          )}
        </header>

        {/* Message List */}
        <div className='flex-1 p-4 md:p-6 space-y-3 overflow-y-auto flex flex-col-reverse custom-scrollbar bg-gradient-to-b from-gray-900 to-gray-900/95'>

          {/* Real-time Messages */}
          {currentChatMessages.map((msg, index) => {
            const isSender = msg.Id === clientId;
            const isRoom = msg.reciverId && (msg.reciverId.includes("+room") || msg.reciverId.includes("room"));

            return (
              <div
                key={index}
                className={`flex w-full ${isSender ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 shadow-md border ${isSender
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm border-indigo-500/50'
                      : 'bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm border-gray-700/50'
                    }`}
                >
                  <p className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${isSender ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {isRoom && (isSender ? 'You' : msg.senderName)}
                    {!isRoom && (isSender ? 'You' : receiverName)}
                  </p>
                  <p className='text-sm leading-relaxed break-words whitespace-pre-wrap'>{msg.message}</p>
                </div>
              </div>
            );
          })}

          {/* Historical Messages */}
          {SyncedMessage.map((val, idx) => {
            const isMe = val.senderId === sender;

            return (
              <div
                key={`hist-${idx}`}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 shadow-sm border ${isMe
                      ? 'bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm border-indigo-500/30'
                      : 'bg-gray-800/90 text-gray-200 rounded-2xl rounded-tl-sm border-gray-700/50'
                    }`}
                >
                  <p className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {isMe ? 'You' : val.senderId}
                  </p>
                  <p className='text-sm leading-relaxed break-words whitespace-pre-wrap'>{val.messageText}</p>
                </div>
              </div>
            );
          })}

          {/* Empty State / Welcome */}
          {currentChatMessages.length === 0 && SyncedMessage.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 opacity-50">
              <div className="p-4 bg-gray-800/50 rounded-full">
                <Send size={32} />
              </div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}

        </div>

        {/* Input Area */}
        <div className='p-4 md:p-6 bg-gray-900 border-t border-gray-800/50'>
          <form onSubmit={messageEmitter} className='flex gap-3 relative max-w-4xl mx-auto w-full'>
            <input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              className='flex-grow bg-gray-800 text-white border border-gray-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500 shadow-inner'
              type='text'
              placeholder={`Message ${receiverName || '...'}`}
            />
            <button
              type='submit'
              disabled={!message.trim() || !receiverName}
              className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2
                ${message.trim() && receiverName
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-indigo-500/20 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default App;