import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Image as ImageIcon, Send, Square } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

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
  const openUpload = useUIStore((state) => state.openUpload);
  const openSearch = useUIStore((state) => state.openSearch);

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
        className={`w-full bg-surface text-textPrimary rounded-3xl flex items-center p-2 border transition-all duration-150 ${
          isFocused ? "border-accent ring-1 ring-accent/30" : "border-border"
        }`}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => openSearch(true)}
          className="p-2 text-textSecondary hover:text-textPrimary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Sparkles size={20} />
        </motion.button>

        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isStreaming ? "AI is typing..." : "Ask AI anything..."}
          disabled={isStreaming}
          className="flex-1 bg-transparent border-none focus:outline-none text-textPrimary px-2 placeholder-textSecondary/40 text-sm"
        />

        <div className="flex items-center gap-1">
          <AnimatePresence mode="popLayout">
            {!value && !isStreaming && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex"
              >
                <button
                  type="button"
                  onClick={() => openUpload(true)}
                  className="p-2 text-textSecondary hover:text-textPrimary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Mic size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => openUpload(true)}
                  className="p-2 text-textSecondary hover:text-textPrimary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <ImageIcon size={20} />
                </button>
              </motion.div>
            )}
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
