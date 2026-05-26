import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isStreaming,
  onStop
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim() && !isStreaming) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-xl px-4 pb-6 pt-2 flex items-center justify-center">
      <motion.div
        layout
        className="w-full rounded-3xl flex items-center p-2 border transition-all duration-150"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: '2px',
          boxShadow: isFocused
            ? 'inset 2px 2px 5px rgba(255, 255, 255, 0.7), inset -3px -3px 6px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.12)'
            : 'inset 2px 2px 5px rgba(255, 255, 255, 0.7), inset -3px -3px 6px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06)',
        }}
      >
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isStreaming ? "AI is typing..." : "Ask AI anything..."}
          disabled={isStreaming}
          className="flex-1 bg-transparent border-none focus:outline-none text-black pl-3 pr-2 placeholder-black/35 text-sm"
        />

        <div className="flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            {value && !isStreaming && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={handleSubmit}
                className="p-2 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors"
              >
                <Send size={18} />
              </motion.button>
            )}
            {isStreaming && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                type="button"
                onClick={onStop}
                className="p-2 bg-danger text-white rounded-full hover:bg-danger/80 transition-colors"
              >
                <Square size={16} fill="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInput;
