export interface SourceChunk {
  id: string;
  filename: string;
  chunkIndex: number;
  content: string;
  score: number;
  docType: 'pdf' | 'docx' | 'txt' | 'md' | 'html';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SourceChunk[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}
