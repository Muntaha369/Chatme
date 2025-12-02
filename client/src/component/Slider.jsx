import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOpen } from '../store/store';

export default function SlideAnimations() {
  const {isOpen, setIsOpen} = useOpen();

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden">

      {/* The Sliding Div 
          - fixed: Keeps it positioned relative to the viewport
          - top-0 left-0: Anchors it to the left side
          - h-screen: Full height
          - w-[300px]: Fixed width of 300px
      */}
      <motion.div
        initial={{ x: "-100%" }} // Start completely off-screen to the left
        animate={{ x: isOpen ? "0%" : "-100%" }} // Move to 0 (visible) or back to -100% (hidden)
        transition={{ type: "spring", stiffness: 260, damping: 20 }} // Add a nice spring effect
        className="fixed top-0 left-0 h-screen w-[300px] bg-emerald-600 shadow-2xl flex flex-col items-center justify-center z-40"
      >
        <h2 className="text-3xl font-bold mb-4">Hello!</h2>
        <p className="text-emerald-100 text-center px-4">
          I am 300px wide and full screen height.
        </p>
        
        {/* Optional: Close button inside the div */}
        <button 
          onClick={() => setIsOpen(false)}
          className="mt-8 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 rounded text-sm"
        >
          Close Me
        </button>
      </motion.div>

    </div>
  );
}