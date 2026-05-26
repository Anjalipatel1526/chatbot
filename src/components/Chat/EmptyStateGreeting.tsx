import React, { useState, useEffect } from 'react';

export const EmptyStateGreeting: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'typing1' | 'waiting1' | 'erasing1' | 'waiting2' | 'typing2' | 'done'>('typing1');
  
  const text1 = "Hello, welcome to Unai";
  const text2 = "Ask anything to Unai";
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (phase === 'typing1') {
      if (displayText.length < text1.length) {
        timer = setTimeout(() => {
          setDisplayText(text1.slice(0, displayText.length + 1));
        }, 75); // Typing speed
      } else {
        setPhase('waiting1');
      }
    } 
    else if (phase === 'waiting1') {
      timer = setTimeout(() => {
        setPhase('erasing1');
      }, 1800); // Delay before erasing
    } 
    else if (phase === 'erasing1') {
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 35); // Erasing speed (faster)
      } else {
        setPhase('waiting2');
      }
    } 
    else if (phase === 'waiting2') {
      timer = setTimeout(() => {
        setPhase('typing2');
      }, 400); // Short delay before second sentence
    } 
    else if (phase === 'typing2') {
      if (displayText.length < text2.length) {
        timer = setTimeout(() => {
          setDisplayText(text2.slice(0, displayText.length + 1));
        }, 75);
      } else {
        setPhase('done');
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, phase]);

  return (
    <div className="flex flex-col items-center justify-center text-center select-none min-h-[4.5rem] mb-4">
      <h1 className="text-4xl font-extrabold text-black tracking-tight flex items-center justify-center h-16">
        <span>{displayText}</span>
        {phase !== 'done' && (
          <span className="w-[3px] h-[2.5rem] bg-black ml-1 animate-[pulse_0.8s_infinite]" />
        )}
      </h1>
    </div>
  );
};

export default EmptyStateGreeting;
