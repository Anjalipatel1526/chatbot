import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const EmptyStateGreeting: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'typing1' | 'waiting1' | 'erasing1' | 'waiting2' | 'typing2' | 'waiting3' | 'erasing2' | 'waiting4'>('typing1');
  
  const text1 = "Hello , Buddy !";
  const text2 = "Ask Anything to Unai...";
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (phase === 'typing1') {
      if (displayText.length < text1.length) {
        timer = setTimeout(() => {
          setDisplayText(text1.slice(0, displayText.length + 1));
        }, 75);
      } else {
        setPhase('waiting1');
      }
    } 
    else if (phase === 'waiting1') {
      timer = setTimeout(() => {
        setPhase('erasing1');
      }, 2000);
    } 
    else if (phase === 'erasing1') {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 35);
      } else {
        setPhase('waiting2');
      }
    } 
    else if (phase === 'waiting2') {
      timer = setTimeout(() => {
        setPhase('typing2');
      }, 400);
    } 
    else if (phase === 'typing2') {
      if (displayText.length < text2.length) {
        timer = setTimeout(() => {
          setDisplayText(text2.slice(0, displayText.length + 1));
        }, 75);
      } else {
        setPhase('waiting3');
      }
    }
    else if (phase === 'waiting3') {
      timer = setTimeout(() => {
        setPhase('erasing2');
      }, 3000); // Keep the second sentence displayed longer before erasing
    }
    else if (phase === 'erasing2') {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 35);
      } else {
        setPhase('waiting4');
      }
    }
    else if (phase === 'waiting4') {
      timer = setTimeout(() => {
        setPhase('typing1');
      }, 400);
    }

    return () => clearTimeout(timer);
  }, [displayText, phase]);

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="flex flex-col items-center justify-center text-center select-none min-h-[4.5rem] mb-4"
    >
      <h1 className="text-4xl font-extrabold text-black tracking-tight flex items-center justify-center h-16">
        <span>{displayText}</span>
        <span className="w-[3px] h-[2.5rem] bg-black ml-1 animate-[pulse_0.8s_infinite]" />
      </h1>
    </motion.div>
  );
};

export default EmptyStateGreeting;
