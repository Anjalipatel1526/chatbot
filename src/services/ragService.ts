import { getSupabaseClient } from './supabase';

// Search Supabase for the most relevant chunks to a query embedding
export async function searchDocumentContext(
  queryEmbedding: number[],
  matchThreshold = 0.3,
  matchCount = 4
): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase not configured, skipping RAG context retrieval.');
    return [];
  }

  try {
    const { data, error } = await supabase.rpc('match_document_sections', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error('RAG search error:', error.message);
      return [];
    }

    return (data || []).map((row: { content: string }) => row.content);
  } catch (err) {
    console.error('RAG search failed:', err);
    return [];
  }
}

export function buildRAGPrompt(userQuestion: string, contextChunks: string[]): string {
  if (contextChunks.length === 0) return userQuestion;

  const context = contextChunks
    .map((chunk, i) => `[Source ${i + 1}]: ${chunk}`)
    .join('\n\n');

  return `You are a helpful AI assistant for UNAI TECH. Answer the user's question. Prioritize using the facts from the provided context below to answer. If the context does not contain the answer or is not relevant, use your own general knowledge to provide a helpful and accurate answer.

---
CONTEXT FROM KNOWLEDGE BASE:
${context}
---

USER QUESTION: ${userQuestion}

ANSWER:`;
}
