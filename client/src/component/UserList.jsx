import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported
import { Zap, PlusCircle, Users, Search, X } from 'lucide-react'; // Added more icons
import ToggleButton from './ToggleButton';
import { multiSocket, useRoom, useReciverId, useDataroom, useUser, useToggler, useContact, useReceiver, useRoomInfo, useParticipants, useAllUser } from '../store/store';

const UserList = ({ socket, roomJoin }) => {
    const { toggler } = useToggler()
    // const { userID } = useUserID();
    const [newRoomName, setNewRoomName] = useState('');
    const { RoomList, setRoomList } = useRoom()
    const [modelOpen, setModelOpen] = useState(false)
    const [participants, setParticipants] = useState([])
    const [coAdmins, setCoAdmins] = useState([])
    const [roomName, setRoomName] = useState('')
    const [changedData, setChangedData] = useState([])
    const [optionOpacity, setOptionOpacity] = useState('')
    const { newAlluser, setnewAlluser } = useAllUser()
    const { contact, setContact } = useContact()
    const { Sockets } = multiSocket();
    const { socketID, setSocketID } = useReciverId();
    const { receiverName, setReceiverName } = useReceiver()
    const { dataRoom } = useDataroom()
    const { user } = useUser();
    const { roomInfo, setRoomInfo } = useRoomInfo()
    const { setParticipants1 } = useParticipants()

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: {
            y: "-20px",
            opacity: 0,
            scale: 0.95,
        },
        visible: {
            y: "0px",
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30
            },
        },
        exit: {
            y: "20px",
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2,
            },
        },
    };

    useEffect(() => {
        const getAlluser = async () => {
            const res = await axios.get('http://localhost:3002/api/all/getData')
            console.log("This is the message", res.data.msg)
            setnewAlluser(res.data.msg)
        }

        getAlluser()

        const getContact = async () => {
            const email = localStorage.getItem('email');
            const res = await axios.post('http://localhost:3002/api/all/addContacts', { clientName: email, contacts: 'USUAL' })
            console.log("This is the ROOMS data", res.data.rooms)

            const contactslist = res.data.msg
            const roomlist = res.data.rooms
            roomlist.map((val) => setRoomInfo(val))
            console.log("This are the rooms", roomlist)
            const newRoomlist = roomlist.map((val) => { return val.roomname })

            console.log("This is stupid roomlist", newRoomlist)

            socket.emit('Room_List', newRoomlist)

            roomlist.map((val) => setRoomList(val.roomname))
            contactslist.map((val) => setContact(val))

        }

        getContact()

    }, [])

    useEffect(() => {
        console.log("now you can see my friend", roomInfo)
    }, [newAlluser, receiverName, roomInfo])

    {/* Ensured socket array is getting updated */ }
    useEffect(() => {
        console.log("This socket belongs", socketID)
    }, [socketID])



    useEffect(() => {
        if (dataRoom && dataRoom.length > 0) {
            setRoomList(dataRoom);
        }
    }, [dataRoom]);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        setModelOpen(true)
    };

    const handleChange = (e) => {
        const input = e.target.value;
        const filteredData = newAlluser.filter((val) =>
            val.toLowerCase().includes(input.toLowerCase())
        );

        setChangedData(filteredData)
        console.log("filterdData", filteredData)
    }

    const AddContact = async (data) => {

        const exists = contact.some(
            (contact) => contact === data
        );

        if (exists) {
            console.log("Contact already exists, skipping update");
            return;  // stop here (don’t call API)
        }
        setContact(data)
        const email = localStorage.getItem('email');
        const UpdateContacts = await axios.post('http://localhost:3002/api/all/addContacts',
            { clientName: email, contacts: data })
        console.log("NewContact", UpdateContacts)
    }

    const manageContactsClick = (val) => {
        const socket = Sockets.find((s) => s.data === val);
        if (socket) {
            setSocketID(socket.socketId);
        } else {
            setSocketID(null)
        }
    };

    const filterParticipants = (val) => {
        const filterAdmin = coAdmins.filter((value) => value != val)
        setCoAdmins(filterAdmin)
        const filter = participants.filter((value) => value != val);
        setParticipants(filter)
    }

    const handleNewRoom = async () => {

        const newSocketID = roomName + "+room"
        const upDatedParticipants = [user, ...coAdmins, ...participants]
        console.log(newSocketID)

        if (roomName) {
            const res = await axios.post('http://localhost:3002/api/all/newRoom',
                {
                    admin: user,
                    coAdmin: coAdmins,
                    participants,
                    roomname: newSocketID
                })
            console.log(res.data)
        }

        setSocketID(newSocketID)
        console.log("They are the participants", socketID)
        roomJoin(upDatedParticipants, newSocketID)
    }

    const handleClick = (val) => {
        const valueFind = roomInfo.find((value) => value.roomname === val)
        if (valueFind) {
            console.log("Matches", valueFind.admin, valueFind.coAdmin, valueFind.participants)
            setParticipants1({ admin: valueFind.admin, coAdmin: valueFind.coAdmin, participants: valueFind.participants })
        }
    }

    const isRoomActive = (roomName) => receiverName === roomName;

    return (
        <div className='w-full h-full p-4 flex flex-col items-start space-y-4 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800/50'>

            {/* --- Room Creation Header --- */}
            <div className="w-full space-y-3 pb-4 border-b border-gray-700/50">
                <h2 className='text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 px-1'>
                    <Users size={16} /> Chat Rooms
                </h2>
                <form className='w-full flex gap-2 items-center relative group'>
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="New Room Name..."
                        className='flex-grow bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-200'
                    />
                    <button
                        onClick={handleCreateRoom}
                        type='submit'
                        className='bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-95 flex-shrink-0'
                        title="Create Room"
                    >
                        <PlusCircle size={18} />
                    </button>
                </form>
            </div>

            {/* --- Rooms List --- */}
            <div className="w-full flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {RoomList.map((val, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                            setSocketID(val)
                            setReceiverName(val)
                            localStorage.setItem('reciver', val)
                            handleClick(val)
                        }}
                        key={idx}
                        className={`group w-full p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent
              ${isRoomActive(val)
                                ? 'bg-indigo-600/90 shadow-md shadow-indigo-900/20 border-indigo-500/30'
                                : 'hover:bg-gray-800/60 hover:border-gray-700/50'}`}
                    >
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg ${isRoomActive(val) ? 'bg-indigo-500/30' : 'bg-gray-700/30 group-hover:bg-gray-700/50'}`}>
                                    <Users className={`${isRoomActive(val) ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'}`} size={18} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className={`font-medium text-sm truncate ${isRoomActive(val) ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                        {val}
                                    </p>
                                    <p className={`text-xs truncate ${isRoomActive(val) ? 'text-indigo-200' : 'text-gray-500'}`}>
                                        Group Chat
                                    </p>
                                </div>
                            </div>
                            {isRoomActive(val) && <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />}
                        </div>
                    </motion.div>
                ))}

                {/* --- Divider --- */}
                <div className="py-2">
                    <div className="h-px bg-gray-700/50 w-full" />
                </div>

                <h2 className='text-sm font-semibold text-gray-400 uppercase tracking-wider px-1 pt-2 pb-1'>
                    Direct Messages
                </h2>

                {/* --- Contacts List --- */}
                {contact && contact.map((val, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                            manageContactsClick(val)
                            setReceiverName(val)
                            localStorage.setItem('reciver', val)
                        }}
                        key={val}
                        className={`group w-full p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent
              ${isRoomActive(val)
                                ? 'bg-indigo-600/90 shadow-md shadow-indigo-900/20 border-indigo-500/30'
                                : 'hover:bg-gray-800/60 hover:border-gray-700/50'}`}
                    >
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="relative">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isRoomActive(val) ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'}`}>
                                        {val.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className={`font-medium text-sm truncate ${isRoomActive(val) ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                        {val}
                                    </p>
                                    <p className={`text-xs truncate ${isRoomActive(val) ? 'text-indigo-200' : 'text-gray-500'}`}>
                                        Online
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* --- Modal --- */}
            <AnimatePresence>
                {modelOpen && (
                    <motion.div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            className={`bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative
                         ${toggler ? 'h-[550px]' : 'h-[450px]'}`}
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Modal Header */}
                            <div className="p-6 pb-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">
                                        {toggler ? 'New Group' : 'New Chat'}
                                    </h3>
                                    <button
                                        onClick={() => setModelOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="bg-gray-800/50 p-1 rounded-lg">
                                    <ToggleButton />
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                                {!toggler ? (
                                    // SEARCH USERS VIEW
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                onChange={handleChange}
                                                placeholder="Search users by email..."
                                                className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            {changedData.length > 0 && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Results</p>}
                                            {changedData.map((data, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        AddContact(data);
                                                        setModelOpen(false); // Close on select for direct chat? Or keep open? Logic preserved as is, just styled.
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 cursor-pointer transition-colors group border border-transparent hover:border-gray-700"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold text-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                        {data.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-200 font-medium">{data}</span>
                                                </div>
                                            ))}
                                            {changedData.length === 0 && (
                                                <div className="text-center py-8 text-gray-500 text-sm">
                                                    Start typing to find users...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    // CREATE GROUP VIEW
                                    <div className="space-y-4">
                                        <input
                                            value={roomName}
                                            required
                                            onChange={(e) => setRoomName(e.target.value)}
                                            placeholder="Group Name"
                                            className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500 font-medium"
                                        />

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                onChange={handleChange}
                                                placeholder="Add participants..."
                                                className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                            />
                                        </div>

                                        {/* Selected Participants Tags */}
                                        {(coAdmins.length > 0 || participants.length > 0) && (
                                            <div className="flex flex-wrap gap-2 p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                                                {coAdmins.map((val, idx) => (
                                                    <span key={`admin-${idx}`} onClick={() => filterParticipants(val)} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-amber-500/30 flex items-center gap-1">
                                                        {val} <span className="opacity-50">★</span>
                                                    </span>
                                                ))}
                                                {participants.map((val, idx) => (
                                                    <span key={`part-${idx}`} onClick={() => filterParticipants(val)} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-indigo-500/30">
                                                        {val}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            {changedData.map((data, index) => (
                                                <div
                                                    key={index}
                                                    onMouseOver={() => setOptionOpacity(index)}
                                                    onMouseLeave={() => setOptionOpacity(false)}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors group border border-transparent hover:border-gray-700 h-[60px]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center font-medium text-sm">
                                                            {data.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-gray-200 text-sm font-medium">{data}</span>
                                                    </div>

                                                    {optionOpacity === index && (
                                                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                                            <button
                                                                onClick={() => setCoAdmins((prev) => [...prev, data])}
                                                                className="px-3 py-1.5 bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-semibold transition-all border border-amber-600/30"
                                                            >
                                                                Admin
                                                            </button>
                                                            <button
                                                                onClick={() => setParticipants((prev) => [...prev, data])}
                                                                className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition-all border border-indigo-600/30"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 pt-4 border-t border-gray-800 bg-gray-900/50">
                                {toggler ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setModelOpen(false)}
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all font-medium text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleNewRoom}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-medium text-sm shadow-lg shadow-indigo-500/20"
                                        >
                                            Create Group
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setModelOpen(false)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all font-medium text-sm"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UserList;