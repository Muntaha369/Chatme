import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io.connect('http://localhost:3002');

const App = () => {
  const [message, setMessage] = useState('');
  const [Id, setId] = useState(socket.id);
  const [messages, setMessages] = useState([]);

  useEffect(() => {

    socket.on('hello', (arg) => {
      setId(arg);
      console.log('Socket ID:', arg);
    });

    socket.on('receive_message', (data) => {
      console.log('Received message:', data.Id, data.message);
      setMessages((prevMessages) => [data, ...prevMessages]);
    });
    return () => {
      socket.off('hello');
      socket.off('receive_message');
    };
  }, []);

  const messageEmitter = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { Id, message });
      setMessages((prevMessages) => [{ Id, message }, ...prevMessages]);
      setMessage(''); 
    }
  };

  return (
    <div className='w-screen h-screen flex-col flex justify-center items-center'>
      <form onSubmit={messageEmitter} className='flex justify-center items-center'>
        <input
          onChange={(e) => setMessage(e.target.value)}
          value={message} 
          className='border outline-0 px-1'
          type='text'
          placeholder='Type a message...'
        />
        <button type='submit' className='border px-2 hover:cursor-pointer'>
          Enter
        </button>
      </form>
      <div className='mt-4 w-1/2 overflow-y-auto h-1/2'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-lg ${msg.Id === Id ? 'bg-green-600 text-right self-end' : 'bg-blue-600 text-left self-start'}`}
          >
            <p className='font-bold'>{msg.Id === Id ? 'You' : `User: ${msg.Id}`}</p>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;