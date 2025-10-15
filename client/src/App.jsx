import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UserList from './component/UserList';
import { multiSocket } from './store/store';
import { useReciverId } from './store/store';

const socket = io.connect('http://localhost:3002');



const App = () => {

  const { socketID } = useReciverId()

  const {setSockets, removeSockets} = multiSocket();

  const [message, setMessage] = useState('');
  const [clientId, setId] = useState(socket.id);
  const [messages, setMessages] = useState([]);

  const SocketArray = []
  
  useEffect(() => {

    socket.on('hello', (arg) => {
      setId(arg);
      console.log('Socket ID:', arg);
    });

    socket.on('emitall',(data)=>{
      SocketArray.push(data)
      console.log("pushed sockets:",SocketArray)
      setSockets(data)
    })

    socket.on('disconectedUser',(data)=>{
      SocketArray.pop(data)
      console.log("Popped Sockets", SocketArray)
      removeSockets(data)
    })

   
    socket.on('receive_message', (data) => {

      setMessages((prevMessages) => [data, ...prevMessages]);
      console.log('Received message:', data.Id, data.message);
    });

    return () => {
      socket.off('hello');
      socket.off('receive_message');
    };
  }, []);

  const messageEmitter = (e) => {
    e.preventDefault();
    
    if (socketID.trim() !== '') {
      if (message.trim()) {
        const newMessage = { Id: clientId, message: message.trim(), reciverId: socketID.trim() };
        

        socket.emit('send_message', newMessage);
        console.log('EMIT:', newMessage);
        
      
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
        
        setMessage(''); // Clear input
      }
    } else {
      alert("Please click a Receiver");
    }
  };

 
const currentChatMessages = messages
  .filter(msg => {
    
    const currentRecipient = socketID;

    
    const isSentToCurrent = msg.Id === clientId && msg.reciverId === currentRecipient;

    
    const isReceivedFromCurrent = msg.Id === currentRecipient && msg.reciverId === clientId;

    
    return isSentToCurrent || isReceivedFromCurrent;
  })
  .slice()

  // --- Component Rendering ---
  return (
    <div className='w-screen h-screen flex justify-center items-cente'>
      <div className='h-full flex justify-center bg-gray-900 w-[30%]'><UserList/></div>
      <div className='w-[70%] h-full flex flex-col bg-gray-900 shadow-2xl overflow-hidden'>
        
        {/* Header/Status */}
        <header className='p-4 bg-gray-800 text-white shadow-md'>
          <h1 className='text-xl font-bold'>Chat Client</h1>
          <p className='text-sm text-gray-400'>Your ID: <span className='font-mono text-green-400'>{clientId || 'Connecting...'}</span></p>
        </header>

        {/* Message Display Area */}
        <div className='flex-1 p-4 space-y-4 overflow-y-auto flex flex-col-reverse'>
          
          {currentChatMessages.map((msg, index) => {

            const isSender = msg.Id === clientId;
            const isPrivate = msg.reciverId && msg.reciverId !== '';
            
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
                    {isSender 
                      ? 'You' 
                      : `User: ${msg.Id}` 
                    }
                    {isPrivate && (
                        <span className='ml-2 text-yellow-300 font-normal'>
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
            <input
              className='w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition'
              type="text"
              placeholder='To ID...'
            />
            <button
              type='submit'
              className='bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md'
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
