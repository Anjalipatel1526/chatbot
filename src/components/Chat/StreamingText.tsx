import React from 'react';

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  isStreaming = false,
}) => {
  return (
    <span className="relative">
      {content}
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 ml-1 bg-accent/80 animate-pulse rounded-sm"
          style={{ verticalAlign: 'middle', display: 'inline-block' }}
        />
      )}
    </span>
  );
};

export default StreamingText;
