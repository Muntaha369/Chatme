import React,{useEffect} from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animation variants for the loading dots
const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2, // Stagger the animation of child elements
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "0%", // Start position
  },
  end: {
    y: "100%", // End position (move down)
  },
};

// Transition settings for the dots' animation
const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity,        // Loop forever
  repeatType: "reverse",   // Bounce back and forth
  ease: "easeInOut",       // Smooth easing
};

const LoadingPage = () => {

  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('authToken')
    
    if(!token){
      navigate('/login')
    }else{
      navigate('/')
    }
  },[])
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Animated Dots Container */}
      <motion.div
        className="flex space-x-2"
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
      >
        {/* Dot 1 */}
        <motion.span
          className="block w-4 h-4 bg-blue-500 rounded-full"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        {/* Dot 2 */}
        <motion.span
          className="block w-4 h-4 bg-blue-400 rounded-full"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        {/* Dot 3 */}
        <motion.span
          className="block w-4 h-4 bg-blue-300 rounded-full"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
      </motion.div>

      {/* Loading Text */}
      <p className="mt-6 text-lg font-semibold text-gray-400 animate-pulse">
        Loading... Please Wait
      </p>
    </div>
  );
};

export default LoadingPage;