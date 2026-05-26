import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log(JSON.stringify({ context: '', sources: [] }));
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.log(JSON.stringify({ context: '', sources: [] }));
    process.exit(0);
  }

  // 1. Get embedding locally
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await extractor(query, { pooling: 'mean', normalize: true });
  const embedding = Array.from(output.data);

  // 2. Query Supabase
  const { data: chunks, error } = await supabase.rpc('match_document_sections', {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 4,
  });

  if (error || !chunks) {
    console.log(JSON.stringify({ context: '', sources: [] }));
    process.exit(0);
  }

  // 3. Format context
  const context = chunks
    .map((c, i) => `[Source ${i + 1}]: ${c.content}`)
    .join('\n\n');

  // 4. Format sources for UI
  const sources = chunks.map((c, idx) => {
    const isCSV = c.content.startsWith('[');
    let filename = 'Untitled document.docx';
    let docType = 'docx';
    if (isCSV) {
      filename = 'UNAI TECH Q&A Knowledge Base (CSV)';
      docType = 'txt';
    }
    return {
      id: c.id,
      filename,
      chunkIndex: idx,
      content: c.content,
      score: Number(c.similarity.toFixed(3)),
      docType
    };
  });

  console.log(JSON.stringify({ context, sources }));
}

main().catch(() => {
  console.log(JSON.stringify({ context: '', sources: [] }));
});
