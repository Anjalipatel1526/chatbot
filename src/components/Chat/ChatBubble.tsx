import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Message } from '@/types';
import SourceCard from './SourceCard';
import StreamingText from './StreamingText';

interface ChatBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onRegenerate }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`group flex gap-3 my-4 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bubble Container */}
      <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]`}>
        {/* Main Card */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-lg border transition-all ${
            isUser
              ? 'bg-accent border-accent text-white rounded-tr-none'
              : 'bg-surface border-border text-textPrimary rounded-tl-none glass'
          }`}
        >
          {/* User Text */}
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          ) : (
            /* Assistant Markdown Text */
            <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-textPrimary/90">
              {message.isStreaming && message.content === '' ? (
                <StreamingText content="" isStreaming={true} />
              ) : (
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom Code Renderer with Copy Button
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const lang = match ? match[1] : '';
                      const getRawText = (child: any): string => {
                        if (typeof child === 'string') return child;
                        if (Array.isArray(child)) return child.map(getRawText).join('');
                        if (child?.props?.children) return getRawText(child.props.children);
                        return '';
                      };
                      const codeValue = getRawText(children).replace(/\n$/, '');
                      const isBlock = !inline && (!!match || codeValue.includes('\n'));
                      if (isBlock) {
                        return <CodeBlock code={codeValue} language={lang || 'text'} />;
                      }
                      return (
                        <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs text-accent border border-border/40" {...props}>
                          {codeValue}
                        </code>
                      );
                    },
                    a({ href, children, ...props }: any) {
                      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                        const isElectron = typeof window !== 'undefined' && 
                          (window as any).process && 
                          (window as any).process.versions && 
                          (window as any).process.versions.electron;
                        
                        if (isElectron && href) {
                          e.preventDefault();
                          try {
                            const { shell } = (window as any).require('electron');
                            shell.openExternal(href);
                          } catch (err) {
                            console.error('Failed to open link with window.require:', err);
                            window.open(href, '_blank');
                          }
                        }
                      };
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleClick}
                          className="text-accent hover:underline font-semibold"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    p({ children }) {
                      return <p className="mb-2 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-4 mb-2">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="mb-0.5">{children}</li>;
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3 border border-border rounded-lg">
                          <table className="w-full text-xs text-left border-collapse">{children}</table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return <thead className="bg-white/5 border-b border-border font-semibold text-textPrimary">{children}</thead>;
                    },
                    th({ children }) {
                      return <th className="px-3 py-2 border-r border-border last:border-0">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-3 py-2 border-r border-b border-border last:border-r-0 last:border-b-0">{children}</td>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
              {message.isStreaming && message.content !== '' && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-accent/80 animate-pulse" />
              )}
            </div>
          )}

          {/* Timestamp on Hover (Desktop) or bottom right */}
          <div className="absolute right-3 -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] text-textSecondary/60 select-none">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>

        {/* AI Action Buttons + Sources Citation Row */}
        {!isUser && !message.isStreaming && (
          <div className="flex flex-col gap-2 mt-1">
            {/* Action Bar */}
            <div className="flex items-center justify-between px-1 text-textSecondary select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyText}
                  className="hover:text-textPrimary transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="hover:text-textPrimary transition-colors"
                    title="Regenerate"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={`transition-colors ${feedback === 'up' ? 'text-success' : 'hover:text-textPrimary'}`}
                  title="Thumbs up"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={`transition-colors ${feedback === 'down' ? 'text-danger' : 'hover:text-textPrimary'}`}
                  title="Thumbs down"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>

              {/* Source count indicator */}
              {message.sources && message.sources.length > 0 && (
                <button
                  onClick={() => setSourcesExpanded(!sourcesExpanded)}
                  className="flex items-center gap-1 text-xs hover:text-textPrimary transition-colors"
                >
                  <span>{message.sources.length} sources</span>
                  {sourcesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>

            {/* Sources Cards Grid */}
            <AnimatePresence>
              {sourcesExpanded && message.sources && message.sources.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2 overflow-hidden mt-1 pl-1"
                >
                  {message.sources.map((source) => (
                    <SourceCard key={source.id} source={source} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* Sub-component: Code Block with Syntax, Language Tag, and Copy */
interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="my-3 border border-border rounded-lg overflow-hidden bg-slate-950">
      {/* Top action header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-border text-[11px] font-mono text-textSecondary select-none">
        <span className="uppercase text-accent font-semibold">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-textPrimary transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-success" />
              <span className="text-success font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Area */}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono bg-slate-950/70 text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default ChatBubble;
