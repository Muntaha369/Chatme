import React from 'react'
import { multiSocket } from '../store/store'
import { useReciverId } from '../store/store';
import { Zap } from 'lucide-react'; // Added icon for visual appeal

const UserList = () => {
  const { Sockets } = multiSocket();
  const { setSocketID } = useReciverId()
  console.log("from list side", Sockets);

  return (
    // FIX: Removed h-screen and items-center from the main wrapper.
    // Added gap-4 for vertical spacing.
    <div className='w-full p-6 flex flex-col items-start space-y-4 max-w-sm mx-auto'>
      <h2 className='text-2xl font-bold text-gray-800 border-b pb-2 w-full'>
        Active Users ({Sockets.length})
      </h2>
      
      {
        Sockets &&
        Sockets.map((val, idx) => (
          <div 
            onClick={()=>setSocketID(val)}
            key={idx} 
            // FIX: Added w-full, p-3, and better styling
            className='w-full h-[75px] rounded-xl bg-gray-800 hover:bg-gray-700 transition duration-150 shadow-lg flex items-center justify-between p-4 cursor-pointer'
          >
            <div className='flex items-center'>
                <Zap className='text-yellow-400 mr-3' size={20} />
                {/* Ensure text is visible against the dark background */}
                <p className='text-white font-medium truncate'>
                    {/* Assuming the socket ID is a long string, truncate it */}
                    {val}
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
