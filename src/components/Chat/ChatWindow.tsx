import React, { useRef, useEffect } from 'react';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from '../Input/ChatInput';
import EmptyStateGreeting from './EmptyStateGreeting';

export const ChatWindow: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    messages,
    isStreaming,
    sendMessage,
    startNewChat,
    clearSession,
    stopGeneration,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find((s) => s.id === activeSessionId);

  // Auto-scroll to bottom on message updates
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isStreaming]);

  // Determine if AI is thinking (waiting for first token)
  const isAwaitingFirstToken =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].content === '';

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between h-14 border-b border-border px-6 flex-shrink-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare size={18} className="text-accent" />
          <h2 className="text-sm font-semibold text-textPrimary truncate">
            {currentSession ? currentSession.title : 'New Chat Session'}
          </h2>
        </div>
        
        {activeSessionId && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearSession}
              disabled={messages.length === 0}
              className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-danger/10 disabled:opacity-30 transition-colors"
              title="Clear Thread"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent hover:text-white transition-all text-xs font-semibold"
            >
              <Plus size={14} />
              <span>New Chat</span>
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        /* Empty state — animated greeting and centered search input */
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <EmptyStateGreeting />
          <ChatInput
            onSend={sendMessage}
            isStreaming={isStreaming}
            onStop={stopGeneration}
          />
        </div>
      ) : (
        <>
          {/* Message thread */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                !(message.role === 'assistant' && message.content === '' && isStreaming) && (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onRegenerate={() => sendMessage(messages[messages.indexOf(message) - 1]?.content || '')}
                  />
                )
              ))}

              {/* Loading Indicator */}
              {isAwaitingFirstToken && (
                <div className="flex justify-start my-4">
                  <TypingIndicator />
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} className="h-10" />
            </div>
          </div>

          {/* Bottom Pinned Input Area (only when messages exist) */}
          <div className="flex-shrink-0 z-10 bg-gradient-to-t from-background via-background to-background/0 flex justify-center w-full">
            <ChatInput
              onSend={sendMessage}
              isStreaming={isStreaming}
              onStop={stopGeneration}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;

