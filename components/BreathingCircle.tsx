import React from 'react';
import { motion, Transition } from 'framer-motion';
import { Phase, BreathPattern } from '../types';

interface Props {
  phase: Phase;
  pattern: BreathPattern;
}

const BreathingCircle: React.FC<Props> = ({ phase, pattern }) => {
  // Define animation variants based on the current phase
  // We use the pattern's timing to determine transition duration
  
  const getScale = () => {
    switch (phase) {
      case 'inhale': return 1.8; // Expand
      case 'hold-in': return 1.85; // Slight pulse bigger
      case 'exhale': return 0.8; // Contract
      case 'hold-out': return 0.75; // Slight pulse smaller
      case 'idle': return 1;
      case 'finished': return 1;
      default: return 1;
    }
  };

  const getTransition = (): Transition => {
    const ease = "easeInOut";
    switch (phase) {
      case 'inhale':
        return { duration: pattern.inhale, ease };
      case 'exhale':
        return { duration: pattern.exhale, ease };
      case 'hold-in':
        // A gentle "alive" pulse during hold
        return { 
          duration: 2, 
          repeat: Infinity, 
          repeatType: "mirror", 
          ease: "linear" 
        };
      case 'hold-out':
        return { 
          duration: 2, 
          repeat: Infinity, 
          repeatType: "mirror", 
          ease: "linear" 
        };
      default:
        return { duration: 1 };
    }
  };

  const getText = () => {
    switch (phase) {
      case 'inhale': return '吸气';
      case 'hold-in': return '屏息';
      case 'exhale': return '呼气';
      case 'hold-out': return '屏息';
      case 'idle': return '准备';
      case 'finished': return '完成';
      default: return '';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Outer Glow/Halo */}
      <motion.div
        className="absolute rounded-full opacity-30 blur-3xl"
        animate={{
          scale: phase === 'idle' ? 1 : getScale() * 1.2,
          backgroundColor: pattern.color,
        }}
        transition={getTransition()}
        style={{ width: '250px', height: '250px' }}
      />

      {/* Main Circle */}
      <motion.div
        className="rounded-full shadow-2xl backdrop-blur-sm z-10 flex items-center justify-center"
        animate={{
          scale: getScale(),
          backgroundColor: pattern.color,
        }}
        transition={getTransition()}
        style={{ width: '200px', height: '200px' }}
      >
        <motion.span 
            className="text-2xl font-light tracking-widest z-20"
            style={{ color: pattern.textColor }}
            // Keep text from scaling with the circle to remain readable
            animate={{ scale: 1 / getScale() }} 
            transition={getTransition()}
        >
          {getText()}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default BreathingCircle;