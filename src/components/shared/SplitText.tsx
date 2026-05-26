import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | string;
  from?: any;
  to?: any;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | string;
  tag?: keyof JSX.IntrinsicElements;
  onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'easeOut',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin as any,
  });

  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const totalDelay = (text.length * delay) + (duration * 1000);
      const timer = setTimeout(() => {
        setHasAnimated(true);
        if (onLetterAnimationComplete) {
          onLetterAnimationComplete();
        }
      }, totalDelay);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasAnimated, text, delay, duration, onLetterAnimationComplete]);

  const words = text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay / 1000,
      },
    },
  };

  const itemVariants = {
    hidden: from,
    visible: {
      ...to,
      transition: {
        duration,
        ease: ease === 'power3.out' ? 'easeOut' : ease,
      },
    },
  };

  const renderContent = () => {
    if (splitType.includes('words')) {
      return words.map((word, wordIdx) => (
        <motion.span
          key={wordIdx}
          variants={itemVariants}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ));
    }

    // Default to 'chars'
    return words.map((word, wordIdx) => (
      <span key={wordIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap', marginRight: '0.25em' }}>
        {word.split('').map((char, charIdx) => (
          <motion.span
            key={charIdx}
            variants={itemVariants}
            style={{ display: 'inline-block' }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    ));
  };

  const Tag = tag as any;

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign: textAlign as any,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}
    >
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{ display: 'inline-block' }}
      >
        {renderContent()}
      </motion.span>
    </Tag>
  );
};

export default SplitText;
