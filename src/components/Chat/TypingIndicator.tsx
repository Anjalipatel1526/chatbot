import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  const dotTransition = (delay: number) => ({
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut' as const,
    delay,
  });

  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-surface border border-border rounded-2xl w-fit glass">
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={dotTransition(0)}
        className="w-2 h-2 bg-accent rounded-full"
      />
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={dotTransition(0.15)}
        className="w-2 h-2 bg-accent rounded-full"
      />
      <motion.span
        animate={{ y: [0, -5, 0] }}
        transition={dotTransition(0.3)}
        className="w-2 h-2 bg-accent rounded-full"
      />
    </div>
  );
};

export default TypingIndicator;
