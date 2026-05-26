import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Upload,
  Search,
  Bot,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';
import ChatList from './ChatList';
import Tooltip from '../shared/Tooltip';

export const Sidebar: React.FC = () => {
  const {
    sidebarOpen,
    toggleSidebar,
    openSettings,
    openUpload,
    openSearch
  } = useUIStore();
  
  const createSession = useChatStore((state) => state.createSession);
  const { theme, setSetting } = useSettingsStore();

  const handleToggleTheme = () => {
    if (theme === 'dark') {
      setSetting('theme', 'light');
    } else if (theme === 'light') {
      setSetting('theme', 'system');
    } else {
      setSetting('theme', 'dark');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon size={18} />;
    if (theme === 'light') return <Sun size={18} />;
    return <Laptop size={18} />;
  };

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 60 },
  };

  return (
    <motion.div
      initial={sidebarOpen ? 'expanded' : 'collapsed'}
      animate={sidebarOpen ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-sidebar border-r border-border flex-shrink-0 z-20 text-textPrimary"
    >
      {/* Top Header Logo + Toggle */}
      <div className="flex items-center justify-between h-14 border-b border-border px-4 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <Bot size={24} className="text-accent flex-shrink-0" />
          {sidebarOpen && (
            <span className="font-bold text-sm bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent truncate select-none">
              Unai Chatbox
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-white/5 text-textSecondary hover:text-textPrimary transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3 flex-shrink-0">
        {sidebarOpen ? (
          <button
            onClick={() => createSession('New Chat Session')}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2 rounded-lg transition-colors border border-accent/25 active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        ) : (
          <Tooltip content="New Chat" position="right">
            <button
              onClick={() => createSession('New Chat Session')}
              className="w-10 h-10 flex items-center justify-center bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors border border-accent/25 active:scale-[0.98]"
            >
              <Plus size={18} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Chat Sessions list */}
      <div className="flex-1 overflow-y-auto min-h-0 border-b border-border">
        {sidebarOpen && (
          <div className="px-4 py-2 text-xs font-semibold text-textSecondary/50 uppercase tracking-wider select-none">
            Recent Conversations
          </div>
        )}
        <ChatList />
      </div>

      {/* Bottom Nav Icons */}
      <div className={`p-3 flex-shrink-0 flex flex-col gap-2 ${sidebarOpen ? '' : 'items-center'}`}>
        {/* Search */}
        {sidebarOpen ? (
          <button
            onClick={() => openSearch(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
          >
            <Search size={18} />
            <span>Semantic Search</span>
          </button>
        ) : (
          <Tooltip content="Semantic Search" position="right">
            <button
              onClick={() => openSearch(true)}
              className="w-10 h-10 flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
            >
              <Search size={18} />
            </button>
          </Tooltip>
        )}

        {/* Upload documents */}
        {sidebarOpen ? (
          <button
            onClick={() => openUpload(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
          >
            <Upload size={18} />
            <span>Upload Documents</span>
          </button>
        ) : (
          <Tooltip content="Upload Documents" position="right">
            <button
              onClick={() => openUpload(true)}
              className="w-10 h-10 flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
            >
              <Upload size={18} />
            </button>
          </Tooltip>
        )}

        {/* Theme and Settings */}
        <div className={`flex ${sidebarOpen ? 'justify-between items-center' : 'flex-col gap-2'} w-full border-t border-border/40 pt-2 mt-1`}>
          <Tooltip content={`Theme: ${theme}`} position="right">
            <button
              onClick={handleToggleTheme}
              className="w-10 h-10 flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
            >
              {getThemeIcon()}
            </button>
          </Tooltip>

          {sidebarOpen ? (
            <button
              onClick={() => openSettings(true)}
              className="flex items-center gap-2 text-textSecondary hover:text-textPrimary hover:bg-white/5 p-2 rounded-lg transition-colors text-sm"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          ) : (
            <Tooltip content="Settings" position="right">
              <button
                onClick={() => openSettings(true)}
                className="w-10 h-10 flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings size={18} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default Sidebar;
