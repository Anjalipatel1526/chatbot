import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const EmptyStateGreeting: React.FC = () => {
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    // Delay before the second sentence starts typing
    const timer = setTimeout(() => {
      setShowSecond(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const firstSentence = "hello,welcome to Unai";
  const secondSentence = "Ask anything to unai";

  // Typing container variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
      }
    }
  } as const;

  // Letter variants
  const letterVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, damping: 15, stiffness: 150 }
    }
  } as const;

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="flex flex-col items-center text-center select-none gap-2.5 mb-2"
    >
      {/* First Sentence */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-textPrimary via-accent to-blue-500 bg-clip-text text-transparent px-4"
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {firstSentence.split(" ").map((word, wordIdx) => (
          <span key={wordIdx} className="mr-2 flex">
            {word.split("").map((char, charIdx) => (
              <motion.span key={charIdx} variants={letterVariants}>
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.div>

      {/* Second Sentence */}
      <div className="h-8">
        {showSecond && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-base text-textSecondary/80 font-medium tracking-wide px-4"
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {secondSentence.split(" ").map((word, wordIdx) => (
              <span key={wordIdx} className="mr-1.5 flex">
                {word.split("").map((char, charIdx) => (
                  <motion.span key={charIdx} variants={letterVariants}>
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyStateGreeting;
