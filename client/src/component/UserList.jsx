import React, { useState,useEffect } from 'react';
import { multiSocket } from '../store/store'; // FIX: Adjusted path to assume store is in the parent directory
import { useReciverId } from '../store/store'; 
import { Zap, PlusCircle } from 'lucide-react'; 
import { useDataroom } from '../store/store';
import { useUserID } from '../store/store';
import { useUser } from '../store/store';
import {motion, AnimatePresence} from 'framer-motion'
import ToggleButton from './ToggleButton';
 
const UserList = () => {
  const { user } = useUser()
  const { userID } = useUserID()
  const { Sockets } = multiSocket(); 
  const { socketID, setSocketID } = useReciverId();
  const [newRoomName, setNewRoomName] = useState('');
  const [RoomList, setRoomList] = useState([])
  const [modelOpen, setModelOpen] = useState(false)
  const {dataRoom} = useDataroom()
  
  // Log the current active user ID for debugging
  // console.log("Current recipient:", socketID);
  // console.log("debug sockets",Sockets)

  // console.log("dataroom",dataRoom)

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

// Animation variants for the modal content
const modalVariants = {
    hidden: {
        y: "-50px", // Start slightly above
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        y: "0px", // End at center
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: {
        y: "30px", // Exit slightly below
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    },
};

  useEffect(() => {
    if (dataRoom && dataRoom.length > 0) {
        // Use the store's data to initialize the local room list
        setRoomList(dataRoom); 
    }
  }, [dataRoom]); 

  useEffect(()=>{
    console.log(modelOpen)
  },[modelOpen])

  const handleCreateRoom = (e) => {
    e.preventDefault();
    // if (newRoomName.trim() === '') {
    //     alert("Please enter a valid room name.");
    //     return;
    // }
    // const roomIdentifier = newRoomName+"+"+"room"
    // console.log("fromUser",roomIdentifier)
    // setRoomList((prev)=>[roomIdentifier, ...prev])
    // console.log(`Creating/Switching to Room: ${newRoomName.trim()}`);
    // setSocketID(roomIdentifier.trim())
    // setNewRoomName('');
    setModelOpen(true)
    // console.log(modelOpen)
  };

  const isRoomActive = (roomName) => socketID === roomName;

  return (
    <div className='w-full p-6 flex flex-col items-start space-y-4 max-w-sm mx-auto'>
      
      {/* --- Room Creation Form --- */}
      <h2 className='text-2xl font-bold text-gray-800 border-b pb-2 w-full'>
        Create New Room
      </h2>
      <form className='w-full flex gap-2 items-center'>
        <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room Name"
            className='flex-grow border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-800 text-white'
        />
        <button
            onClick={handleCreateRoom}
            type='submit'
            className='bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-150 shadow-md'
        >
            <PlusCircle size={20} />
        </button>
      </form>

      {
        modelOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 mb-0 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden">

            <motion.div
              className="bg-gray-900 border-2 border-gray-700 rounded-xl shadow-2xl p-6 max-w-2xl h-[35%] w-full relative"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit">
                              <p className='text-lg font-bold'>Create Chat</p>
                              <div className='mt-3'>
                                <ToggleButton/>
                              </div>
            </motion.div>

          </motion.div>
        )
      }

      {
        RoomList.map((val, idx)=>(
          <div
          onClick={() => {
            setSocketID(val)       
          }}
          key = {idx}
          className={`w-full h-[75px] rounded-xl transition duration-150 shadow-lg flex items-center justify-between p-4 cursor-pointer 
          ${isRoomActive(val) ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
           <div className='flex items-center'>
                <Zap className='text-yellow-400 mr-3' size={20} />
                <p className='text-white font-medium truncate'>
                    Group: {val}
                </p>
            </div> 
          </div>
        ))
      }

      {/* --- Chat Options List --- */}

      {/* 2. Active User List --- */}
      <h2 className='text-2xl font-bold text-gray-800 border-b pb-2 w-full pt-4'>
        Active Users ({Sockets.length})
      </h2>
      
      {
        Sockets &&
        Sockets.map((val) => (
          
          <div 
            onClick={() => setSocketID(val)}
            key={val} 
            className={`w-full h-[75px] rounded-xl transition duration-150 shadow-lg flex items-center justify-between p-4 cursor-pointer 
                      ${isRoomActive(val) ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <div className='flex items-center'>
                <Zap className='text-yellow-400 mr-3' size={20} />
                <p className='text-white font-medium truncate'>
                  {userID === val ? `User: ${user}`: `User: ${val.substring(0, 8)}...`}
                    {/* User: {val.substring(0, 8)}... */}
                </p>
            </div>
            <span className='text-green-400 text-xs font-mono'>ONLINE</span>
          </div>
        ))
      }
    </div>
  );
}

export default UserList;