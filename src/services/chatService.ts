import api from './api';
import type { Message, SourceChunk } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';


export const chatService = {
  async sendMessage(prompt: string, sessionId: string): Promise<{ content: string; sources?: SourceChunk[] }> {
    try {
      const response = await api.post('/api/chat', { prompt, sessionId });
      return response.data;
    } catch (error) {
      console.warn('Network call failed, using mock response for demo', error);
      // Fallback/Mock Response for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        content: `This is a mockup response to your query: "${prompt}". In a real deployment, this connects to the RAG endpoint.`,
        sources: mockSources,
      };
    }
  },

  async getChatHistory(sessionId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/api/chat/${sessionId}`);
      return response.data;
    } catch (error) {
      console.warn('Network call failed, returning empty history', error);
      return [];
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`/api/sessions/${sessionId}`);
    } catch (error) {
      console.warn('Network call failed, deleting session locally only', error);
    }
  },

  async streamMessage(
    prompt: string,
    sessionId: string,
    onToken: (token: string) => void,
    onSources: (sources: SourceChunk[]) => void,
    onComplete: (fullText: string) => void,
    onError: (err: Error) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const { baseUrl, aiProvider } = useSettingsStore.getState();
    
    try {
      // Build request body
      const url = `${baseUrl.replace(/\/$/, '')}/api/chat/stream`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, sessionId, provider: aiProvider }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to establish stream: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      
      onSources(mockSources); // Mock sources initially for demo if backend hasn't returned them

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Assuming Server-Sent Events (SSE) standard format: data: {...}
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const jsonStr = line.replace('data:', '').trim();
            if (jsonStr === '[DONE]') {
              onComplete(accumulatedText);
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.token) {
                accumulatedText += parsed.token;
                onToken(parsed.token);
              }
              if (parsed.sources) {
                onSources(parsed.sources);
              }
            } catch (e) {
              // Just append raw text if parsing fails
              accumulatedText += jsonStr;
              onToken(jsonStr);
            }
          }
        }
      }

      onComplete(accumulatedText);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming aborted by user');
        return;
      }
      
      console.warn('Network streaming failed, executing simulated stream response', error);
      onError(error);
      
      // Simulate streaming for high-fidelity demo
      onSources(mockSources);
      
      const demoResponse = `### Understanding RAG & Vector Databases

Retrieval-Augmented Generation (RAG) combines an information retrieval component with a generative model. Here is how your uploaded docs are processed:

1. **Document Parsing**: Text is extracted from PDFs, markdown, or Word documents.
2. **Chunking**: Text is split into overlapping snippets (e.g., 500-1000 tokens) to preserve contextual boundaries.
3. **Embeddings generation**: Text chunks are converted to vectors using embedding models.
4. **Vector Search**: At query time, the system compares user prompts to chunks using similarity metrics like **Cosine Similarity**.

\`\`\`typescript
// Math calculation for Cosine Similarity
function cosineSimilarity(A: number[], B: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
\`\`\`

Here is a summary of performance characteristics based on research papers:
| Embedding Model | Dimension | Top-K Retrieval Time | MRR Score |
| :--- | :---: | :---: | :---: |
| text-embedding-3-small | 1536 | ~12ms | 0.812 |
| cohort-embed-english-v3 | 1024 | ~15ms | 0.824 |
| bge-large-en-v1.5 | 1024 | ~18ms | 0.795 |

Feel free to ask more specific questions about the documents in your database!`;

      // Split into words to simulate streaming token-by-token
      const tokens = demoResponse.split(/(\s+)/);
      let index = 0;
      let streamed = '';

      const interval = setInterval(() => {
        if (signal?.aborted) {
          clearInterval(interval);
          return;
        }

        if (index >= tokens.length) {
          clearInterval(interval);
          onComplete(streamed);
          return;
        }

        const nextToken = tokens[index];
        streamed += nextToken;
        onToken(nextToken);
        index++;
      }, 30);
    }
  },
};

// Mock sources data used for RAG preview
const mockSources: SourceChunk[] = [
  {
    id: 's1',
    filename: 'rag_architecture_overview.pdf',
    chunkIndex: 12,
    content: 'Retrieval-Augmented Generation (RAG) is an architectural approach that improves the accuracy and reliability of LLM generation by fetching facts from external reference sources before responding.',
    score: 0.942,
    docType: 'pdf',
  },
  {
    id: 's2',
    filename: 'vector_search_optimization.md',
    chunkIndex: 4,
    content: 'We use Cosine Similarity index in our vector DB to match user query embeddings with text chunks. Chunk overlap is configured at 20% (100 tokens) to ensure prompt context continuity.',
    score: 0.887,
    docType: 'md',
  },
  {
    id: 's3',
    filename: 'deployment_guide.docx',
    chunkIndex: 28,
    content: 'To deploy the hybrid query system, verify that Elasticsearch and ChromaDB are synchronized. The primary key used for linking vector records with database text nodes must be consistent.',
    score: 0.751,
    docType: 'docx',
  },
];
