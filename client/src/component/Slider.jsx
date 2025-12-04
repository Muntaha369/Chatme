import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOpen, useParticipants, useUser } from '../store/store'; // assuming path remains same
import axios from 'axios';

// --- 1. USER ROW COMPONENT (Unchanged) ---
const UserRow = ({ name, role, onRemove }) => {
  const { admin } = useParticipants();
  const { user } = useUser();

  if (!name) return null;

  return (
    <div className="group flex items-center justify-between p-3 mb-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-default border border-transparent hover:border-white/10">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shadow-sm shrink-0
          ${role === 'Admin' ? 'bg-yellow-400 text-yellow-900' :
            role === 'Co-Admin' ? 'bg-blue-400 text-blue-900' :
            'bg-emerald-200 text-emerald-800'}`}>
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white truncate">
            {name}
          </span>
          {role && (
            <span className={`text-[10px] uppercase tracking-wider font-bold 
              ${role === 'Admin' ? 'text-yellow-300' : 'text-blue-300'}`}>
              {role}
            </span>
          )}
        </div>
      </div>

      {admin === user &&
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded transition-all duration-200 shadow-sm transform hover:scale-105"
          title="Remove Participant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      }
    </div>
  );
};

// --- 2. MAIN COMPONENT ---
export default function SlideAnimations() {
  const { isOpen, setOpen } = useOpen(); // Left sidebar state
  const { admin, coAdmin, participants, setParticipants1 } = useParticipants();
  
  // New State for Right "Add User" Panel
  const [isAddPanelOpen, setAddPanelOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  const handleRemoveUser = (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      console.log(`Removing ${name}...`);
      const roomname = localStorage.getItem('reciver')
      const res = axios.post('http://localhost:3002/api/all/removeUser', { roomName: roomname, user: name })
      console.log(`${name} is removed`, res)

      const upDatedParticipants = participants.filter((val) => val != name)
      const upDatedCoAdmin = coAdmin.filter((val) => val != name)

      setParticipants1({ admin, coAdmin: upDatedCoAdmin, participants: upDatedParticipants })
    }
  };

  useEffect(() => {
    console.log("Left Sidebar Open:", isOpen)
  }, [isOpen])

  // Open the right panel
  const handleAddParticipantClick = () => {
    setAddPanelOpen(true);
  };

  // Submit logic for adding a user
  const submitNewUser = () => {
    if(!newUserName.trim()) return alert("Please enter a name");
    console.log("Adding user:", newUserName);
    
    // Add your axios call here to add the user
    // e.g., axios.post(..., { user: newUserName })
    
    setNewUserName(""); // Reset input
    setAddPanelOpen(false); // Close panel
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden font-sans">

      {/* --- OVERLAY --- */}
      {/* Shared overlay: Closes whichever panel is open */}
      {(isOpen || isAddPanelOpen) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setOpen(false);
            setAddPanelOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* --- LEFT SIDEBAR (Participants List) --- */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-[370px] bg-slate-800 border-r border-slate-700 shadow-2xl flex flex-col z-50"
      >
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-400 tracking-tight">Room Participants</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Admin Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Administrator</h3>
            <UserRow name={admin} role="Admin" onRemove={handleRemoveUser} />
          </div>

          {/* Co-Admins Section */}
          {(coAdmin && coAdmin.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Co-Admins</h3>
              {coAdmin.map((person, idx) => (
                <UserRow key={`co-${idx}`} name={person} role="Co-Admin" onRemove={handleRemoveUser} />
              ))}
            </div>
          )}

          {/* Participants Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Members</h3>
              <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                {participants ? participants.length : 0}
              </span>
            </div>

            {participants && participants.length > 0 ? (
              participants.map((person, idx) => (
                <UserRow key={`p-${idx}`} name={person} onRemove={handleRemoveUser} />
              ))
            ) : (
              <div className="p-4 text-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">
                No participants yet
              </div>
            )}
          </div>
        </div>

        {/* Footer / Add Button */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <button
            onClick={handleAddParticipantClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" x2="20" y1="8" y2="14" /><line x1="23" x2="17" y1="11" y2="11" /></svg>
            Add New Participant
          </button>
        </div>
      </motion.div>

      {/* --- RIGHT SIDEBAR (Add Participant Panel) --- */}
      <motion.div
        initial={{ x: "100%" }} // Start off-screen to the RIGHT
        animate={{ x: isAddPanelOpen ? "0%" : "100%" }} // Slide in to 0
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-screen w-[350px] bg-slate-800 border-l border-slate-700 shadow-2xl flex flex-col z-50"
      >
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-400 tracking-tight">Invite User</h2>
          <button
            onClick={() => setAddPanelOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Username or Email</label>
            <input 
              type="text" 
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
              placeholder="e.g. john_doe"
            />
          </div>
          
          <div className="pt-4">
            <button 
              onClick={submitNewUser}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg transition-all"
            >
              Send Invite
            </button>
            <button 
              onClick={() => setAddPanelOpen(false)}
              className="w-full mt-3 py-2 px-4 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}