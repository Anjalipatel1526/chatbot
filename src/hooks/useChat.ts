import { useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useStreaming } from './useStreaming';

export const useChat = () => {
  const {
    sessions,
    activeSessionId,
    messages,
    createSession,
    setActiveSession,
    deleteSession,
    clearSession,
    setMessages,
  } = useChatStore();

  const { stream, stop, isStreaming } = useStreaming();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    let currentSessionId = activeSessionId;
    
    // Create new session if none is active
    if (!currentSessionId) {
      // First 4 words or 25 chars as session name
      const title = content.split(' ').slice(0, 4).join(' ') || 'New Chat';
      currentSessionId = createSession(title);
    } else {
      // If we are currently in a session, update title if it's default
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession && currentSession.title === 'New Chat Session') {
        const title = content.split(' ').slice(0, 4).join(' ') || 'New Chat';
        useChatStore.setState(state => ({
          sessions: state.sessions.map(s => s.id === currentSessionId ? { ...s, title } : s)
        }));
      }
    }

    // Call stream API
    await stream(content, currentSessionId);
  }, [activeSessionId, createSession, sessions, stream]);

  const selectSession = useCallback((id: string) => {
    setActiveSession(id);
    // In a real application, you would load messages from chatService.getChatHistory(id)
    // For demo/prototype, we just keep the active list, or mock some historical messages
    const mockHistories: Record<string, any[]> = {
      's1': [
        { id: 'm1', role: 'user', content: 'What is RAG?', timestamp: new Date(Date.now() - 600000) },
        { id: 'm2', role: 'assistant', content: 'RAG stands for Retrieval-Augmented Generation. It retrieves documents to feed into the prompt of an LLM.', timestamp: new Date(Date.now() - 590000) }
      ],
    };
    setMessages(mockHistories[id] || []);
  }, [setActiveSession, setMessages]);

  const startNewChat = useCallback(() => {
    createSession('New Chat Session');
  }, [createSession]);

  return {
    sessions,
    activeSessionId,
    messages,
    isStreaming,
    sendMessage,
    selectSession,
    startNewChat,
    deleteSession,
    clearSession,
    stopGeneration: stop,
  };
};
