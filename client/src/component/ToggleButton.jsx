import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToggler } from '../store/store';

// Define the type for the props if using TypeScript
// interface ToggleButtonProps {
//   label?: string;
//   initialState?: boolean;
//   onChange?: (isOn: boolean) => void;
// }

const ToggleButton = ({ label = "Toggle", initialState = false, onChange }) => {
  const [isOn, setIsOn] = useState(initialState);
  const { setToggler } = useToggler()
  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    setToggler(newState)
    if (onChange) {
      onChange(newState); // Notify parent component of the change
    }
  };

  // Animation variants for the knob
  const knobVariants = {
    off: { x: 0 },
    on: { x: 0 }, // 'layout' prop handles the movement automatically based on flex justification change
  };

  // Transition settings for smooth animation
  const spring = {
    type: "spring",
    stiffness: 500,
    damping: 30
  };

  return (
    <div className="flex items-center justify-between w-full bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
      {label && <span className="text-sm font-medium text-gray-300">Is this a group chat?</span>}
      
      <div
        className={`relative flex items-center w-11 h-6 rounded-full cursor-pointer px-1 transition-colors duration-300 ease-in-out border border-transparent focus:ring-2 focus:ring-indigo-500/50 focus:outline-none ${
          isOn ? 'bg-indigo-600' : 'bg-gray-600'
        }`}
        onClick={toggleSwitch}
        role="switch"
        aria-checked={isOn}
        tabIndex={0} // Make it focusable
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSwitch(); }} // Keyboard accessibility
        style={{ justifyContent: isOn ? 'flex-end' : 'flex-start' }}
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full shadow-sm"
          layout // Enables smooth layout animation between flex-start and flex-end
          transition={spring}
        />
      </div>
    </div>
  );
};

export default ToggleButton;