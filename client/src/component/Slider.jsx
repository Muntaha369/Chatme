import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOpen, useParticipants, useUser, useAllUser } from '../store/store';
import axios from 'axios';

// --- MOCK DATABASE FOR SUGGESTIONS ---
const MOCK_ALL_USERS = [
  "alice_wonderland",
  "bob_builder",
  "charlie_brown",
  "david_beckham",
  "eve_polastri",
  "frank_ocean",
  "grace_hopper",
  "harry_potter",
  "iron_man",
  "jack_sparrow"
];

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
  const { isOpen, setOpen } = useOpen();
  const { admin, coAdmin, participants, setParticipants1 } = useParticipants();
  const {newAlluser} = useAllUser()
  
  const [isAddPanelOpen, setAddPanelOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  
  
  // New State for Suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Handle Input Change & Filter Suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewUserName(value);

    if (value.trim().length > 0) {
      // Filter logic: Check if user exists in mock DB and isn't already in the room
      const filtered = newAlluser.filter((u) => 
        u.toLowerCase().includes(value.toLowerCase()) && 
        !participants.includes(u) && // Exclude if already in room
        u !== admin // Exclude admin
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Handle Clicking a Suggestion
  const selectSuggestion = (name) => {
    setNewUserName(name);
    setSuggestions([]); // Close suggestions
  };

  const handleRemoveUser = (name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      console.log(`Removing ${name}...`);
      // Simulating API removal
      const upDatedParticipants = participants.filter((val) => val != name)
      const upDatedCoAdmin = coAdmin.filter((val) => val != name)
      setParticipants1({ admin, coAdmin: upDatedCoAdmin, participants: upDatedParticipants })
    }
  };

  const submitNewUser = () => {
    if(!newUserName.trim()) return alert("Please enter a name");
    console.log("Adding user:", newUserName);
    
    // Add logic to update store/backend
    
    setNewUserName(""); 
    setSuggestions([]);
    setAddPanelOpen(false); 
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden font-sans">

      {/* --- OVERLAY --- */}
      {(isOpen || isAddPanelOpen) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setOpen(false);
            setAddPanelOpen(false);
            setSuggestions([]); // Clear suggestions on close
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* --- LEFT SIDEBAR (Unchanged) --- */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-[370px] bg-slate-800 border-r border-slate-700 shadow-2xl flex flex-col z-50"
      >
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-400 tracking-tight">Room Participants</h2>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Administrator</h3>
            <UserRow name={admin} role="Admin" onRemove={handleRemoveUser} />
          </div>
          {(coAdmin && coAdmin.length > 0) && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Co-Admins</h3>
              {coAdmin.map((person, idx) => (
                <UserRow key={`co-${idx}`} name={person} role="Co-Admin" onRemove={handleRemoveUser} />
              ))}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Members</h3>
              <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{participants ? participants.length : 0}</span>
            </div>
            {participants && participants.length > 0 ? (
              participants.map((person, idx) => (
                <UserRow key={`p-${idx}`} name={person} onRemove={handleRemoveUser} />
              ))
            ) : (
              <div className="p-4 text-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-sm">No participants yet</div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/30">
          <button onClick={() => setAddPanelOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold shadow-lg transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" x2="20" y1="8" y2="14" /><line x1="23" x2="17" y1="11" y2="11" /></svg>
            Add New Participant
          </button>
        </div>
      </motion.div>

      {/* --- RIGHT SIDEBAR (Add User with Dynamic Suggestions) --- */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isAddPanelOpen ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-screen w-[350px] bg-slate-800 border-l border-slate-700 shadow-2xl flex flex-col z-50"
      >
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-400 tracking-tight">Invite User</h2>
          <button onClick={() => setAddPanelOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 relative"> {/* Added relative for dropdown positioning */}
          
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-2">Username or Email</label>
            <input 
              type="text" 
              value={newUserName}
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600"
              placeholder="Start typing..."
            />

            {/* --- SUGGESTIONS DROPDOWN --- */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-700 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="px-4 py-3 cursor-pointer hover:bg-blue-600 hover:text-white text-slate-200 transition-colors flex items-center gap-2"
                    >
                      <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {suggestion.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={submitNewUser}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg transition-all"
            >
              Send Invite
            </button>
            <button 
              onClick={() => {
                setAddPanelOpen(false);
                setSuggestions([]);
              }}
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