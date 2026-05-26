import React from 'react';
import { useChatStore } from '@/store/chatStore';
import SidebarItem from './SidebarItem';

export const ChatList: React.FC = () => {
  const { sessions, activeSessionId, setActiveSession, deleteSession } = useChatStore();

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center text-textSecondary/40 text-xs">
        No active chat sessions.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto max-h-full py-2">
      {sessions.map((session) => (
        <SidebarItem
          key={session.id}
          id={session.id}
          title={session.title}
          updatedAt={session.updatedAt}
          isActive={session.id === activeSessionId}
          onSelect={() => setActiveSession(session.id)}
          onDelete={() => deleteSession(session.id)}
        />
      ))}
    </div>
  );
};
export default ChatList;
