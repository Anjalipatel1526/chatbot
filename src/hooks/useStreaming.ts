import { useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/chatService';

export const useStreaming = () => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { isStreaming, setStreaming, addMessage } = useChatStore();

  const stream = useCallback(async (prompt: string, sessionId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setStreaming(true);

    // 1. Add user message
    const userMsg = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user' as const,
      content: prompt,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // 2. Add assistant message (initially streaming)
    const assistantMsgId = Math.random().toString(36).substring(2, 9);
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant' as const,
      content: '',
      timestamp: new Date(),
      sources: [],
      isStreaming: true,
    };
    addMessage(assistantMsg);

    try {
      await chatService.streamMessage(
        prompt,
        sessionId,
        (token) => {
          useChatStore.setState((state) => {
            const updated = [...state.messages];
            const index = updated.findIndex((m) => m.id === assistantMsgId);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                content: updated[index].content + token,
              };
            }
            return { messages: updated };
          });
        },
        (sources) => {
          useChatStore.setState((state) => {
            const updated = [...state.messages];
            const index = updated.findIndex((m) => m.id === assistantMsgId);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                sources,
              };
            }
            return { messages: updated };
          });
        },
        (fullText) => {
          useChatStore.setState((state) => {
            const updated = [...state.messages];
            const index = updated.findIndex((m) => m.id === assistantMsgId);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                content: fullText,
                isStreaming: false,
              };
            }
            return { messages: updated, isStreaming: false };
          });
          abortControllerRef.current = null;
        },
        (error) => {
          useChatStore.setState((state) => {
            const updated = [...state.messages];
            const index = updated.findIndex((m) => m.id === assistantMsgId);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                content: `Streaming failed: ${error.message}`,
                isStreaming: false,
              };
            }
            return { messages: updated, isStreaming: false };
          });
          abortControllerRef.current = null;
        },
        controller.signal
      );
    } catch (err: any) {
      console.error(err);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  }, [addMessage, setStreaming]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreaming(false);
      
      useChatStore.setState((state) => {
        const updated = [...state.messages];
        if (updated.length > 0) {
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              isStreaming: false,
            };
          }
        }
        return { messages: updated };
      });
    }
  }, [setStreaming]);

  return { stream, stop, isStreaming };
};
