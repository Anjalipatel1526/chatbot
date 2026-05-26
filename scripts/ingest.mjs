import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import mammoth from 'mammoth';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DOC_PATH     = path.resolve(__dirname, '../src/assets/Untitled document.docx');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function chunkText(text, chunkSize = 500, overlap = 80) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + chunkSize).trim();
    if (chunk.length > 40) chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

async function main() {
  console.log('🤖 Loading local embedding model (first run downloads ~25MB)...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✅ Model ready.\n');

  console.log('📄 Extracting text from DOCX...');
  const { value: rawText } = await mammoth.extractRawText({ path: DOC_PATH });
  console.log(`✅ Extracted ${rawText.length} characters.`);

  const chunks = chunkText(rawText);
  console.log(`🔪 Split into ${chunks.length} chunks.\n`);

  // Clean up old incomplete records
  await supabase.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create document record
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ name: 'Untitled document.docx', size: rawText.length })
    .select()
    .single();

  if (docErr) {
    console.error('❌ Failed to create document record:', docErr.message);
    process.exit(1);
  }
  console.log(`📁 Document record created: ${doc.id}\n`);

  let success = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`⚡ Embedding chunk ${i + 1}/${chunks.length}...`);

    try {
      const output = await extractor(chunk, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      const { error: secErr } = await supabase
        .from('document_sections')
        .insert({ document_id: doc.id, content: chunk, embedding });

      if (secErr) {
        console.log(` ❌ ${secErr.message}`);
      } else {
        console.log(' ✅');
        success++;
      }
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! ${success}/${chunks.length} chunks indexed in Supabase.`);
  console.log('🤖 Your Unai Chatbox can now answer questions from this document!');
}

main().catch(console.error);
