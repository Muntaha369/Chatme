import React, {useEffect} from 'react';
import { motion } from 'framer-motion';
import { useOpen, useParticipants } from '../store/store';
const UserRow = ({ name, role, onRemove }) => {
  if (!name) return null;

  return (
    <div className="group flex items-center justify-between p-3 mb-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-default border border-transparent hover:border-white/10">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Avatar Circle */}
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
          {/* Optional Role Badge */}
          {role && (
            <span className={`text-[10px] uppercase tracking-wider font-bold 
              ${role === 'Admin' ? 'text-yellow-300' : 'text-blue-300'}`}>
              {role}
            </span>
          )}
        </div>
      </div>

      {/* Remove Button - Hidden by default, Visible on Hover */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent clicking the row
          onRemove(name);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded transition-all duration-200 shadow-sm transform hover:scale-105"
        title="Remove Participant"
      >
        {/* X Icon SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---
export default function SlideAnimations() {
  const { isOpen, setOpen } = useOpen();
  
  // Destructuring your store data
  const { admin, coAdmin, participants } = useParticipants(); 

  // Handlers
  const handleRemoveUser = (name) => {
    // Add your logic to remove user from store/DB here
    if(window.confirm(`Are you sure you want to remove ${name}?`)) {
      console.log(`Removing ${name}...`);
    }
  };

  useEffect(()=>{
    console.log("isOpen", isOpen)
  },[isOpen])

  const handleAddParticipant = () => {
    console.log("Open Add Modal");
    // logic to open a modal or prompt
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden font-sans">

      {/* Overlay Background (Click to close) */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(!isOpen)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* The Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-[370px] bg-slate-800 border-r border-slate-700 shadow-2xl flex flex-col z-50"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-400 tracking-tight">Room Participants</h2>
          <button 
            onClick={() => setOpen(!isOpen)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Scrollable List */}
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
            onClick={handleAddParticipant}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>
            Add New Participant
          </button>
        </div>

      </motion.div>

    </div>
  );
}