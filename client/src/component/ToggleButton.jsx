import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define the type for the props if using TypeScript
// interface ToggleButtonProps {
//   label?: string;
//   initialState?: boolean;
//   onChange?: (isOn: boolean) => void;
// }

const ToggleButton = ({ label = "Toggle", initialState = false, onChange }) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onChange) {
      onChange(newState); // Notify parent component of the change
    }
  };

  // Animation variants for the knob
  const knobVariants = {
    off: { x: 0 },
    on: { x: 3 }, // Adjust based on width (w-12 = 48px, knob w-6 = 24px, movement = 48-24 = 24px)
  };

  // Transition settings for smooth animation
  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30
  };

  return (
    <div className="flex items-center space-x-3">
      {label && <span className="text-sm font-medium text-gray-700">Is this a group chat ?</span>}
      <div
        className={`flex items-center w-8 h-4 rounded-full cursor-pointer p-1 transition-colors duration-200 ease-in-out ${
          isOn ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
        }`}
        onClick={toggleSwitch}
        role="switch"
        aria-checked={isOn}
        tabIndex={0} // Make it focusable
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSwitch(); }} // Keyboard accessibility
      >
        <motion.div
          className="w-3 h-3 bg-white rounded-full shadow-md"
          layout // Enables smooth layout animation
          variants={knobVariants}
          animate={isOn ? "on" : "off"}
          transition={spring}
        />
      </div>
    </div>
  );
};

export default ToggleButton;