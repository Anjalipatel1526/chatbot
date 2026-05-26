import { create } from 'zustand';
import type { ChatSession, Message } from '@/types';

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: Message[];
  isStreaming: boolean;
  setStreaming: (isStreaming: boolean) => void;
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  createSession: (title?: string) => string;
  setActiveSession: (id: string | null) => void;
  deleteSession: (id: string) => void;
  clearSession: () => void;
  setSessions: (sessions: ChatSession[]) => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isStreaming: false,

  setStreaming: (isStreaming) => set({ isStreaming }),

  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, msg] 
  })),

  updateLastMessage: (content) => set((state) => {
    const updated = [...state.messages];
    if (updated.length > 0) {
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        content,
        timestamp: new Date(),
      };
    }
    return { messages: updated };
  }),

  createSession: (title) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newSession: ChatSession = {
      id,
      title: title || 'New Chat Session',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: id,
      messages: [],
    }));
    return id;
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id });
  },

  deleteSession: (id) => {
    set((state) => {
      const filtered = state.sessions.filter((s) => s.id !== id);
      const nextActiveId = state.activeSessionId === id 
        ? (filtered.length > 0 ? filtered[0].id : null) 
        : state.activeSessionId;
      
      return {
        sessions: filtered,
        activeSessionId: nextActiveId,
        messages: state.activeSessionId === id ? [] : state.messages,
      };
    });
  },

  clearSession: () => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;
    set({ messages: [] });
  },

  setSessions: (sessions) => set({ sessions }),
  setMessages: (messages) => set({ messages }),
}));
