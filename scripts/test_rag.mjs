import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRAG(query) {
  console.log(`🔍 Query: "${query}"`);

  // 1. Local embedding
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await extractor(query, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);

  // 2. Supabase Search
  const { data: chunks, error } = await supabase.rpc('match_document_sections', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 3,
  });

  if (error) {
    console.error('❌ Supabase search error:', error.message);
    return;
  }

  console.log(`\n📚 Matched ${chunks?.length || 0} chunks from Supabase:`);
  chunks?.forEach((c, idx) => {
    console.log(`  [${idx + 1}] (similarity: ${c.similarity.toFixed(4)}): ${c.content.substring(0, 150)}...`);
  });

  // 3. FastAPI Chat Completion
  const context = (chunks || []).map(c => c.content).join('\n\n');
  const ragPrompt = `You are a helpful assistant for UNAI TECH. Answer the user's question using ONLY the context provided below. If the answer is not in the context, say "I don't have information about that in my knowledge base."

---
CONTEXT:
${context}
---

USER QUESTION: ${query}

ANSWER:`;

  console.log('\n💬 Sending prompt to FastAPI backend...');
  try {
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: ragPrompt, sessionId: 'test-session' })
    });

    if (!response.ok) {
      console.error(`❌ Server error: ${response.statusText}`);
      const err = await response.text();
      console.error(err);
      return;
    }

    const resJson = await response.json();
    console.log('\n🤖 Answer from LLM:');
    console.log(resJson.content);
  } catch (err) {
    console.error('❌ Failed to call backend:', err.message);
  }
}

const query = process.argv[2] || 'Who is Vetha Gokul?';
testRAG(query).catch(console.error);
