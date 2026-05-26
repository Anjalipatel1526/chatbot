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
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🤖 Loading local embedding model...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✅ Model ready.\n');

  // 1. Fetch all rows from qa_knowledge table
  console.log('📋 Fetching Q&A rows from Supabase...');
  const { data: rows, error: fetchErr } = await supabase
    .from('qa_knowledge')
    .select('id, category, question, answer');

  if (fetchErr) {
    console.error('❌ Failed to fetch qa_knowledge:', fetchErr.message);
    process.exit(1);
  }

  console.log(`✅ Found ${rows.length} Q&A pairs to index.\n`);

  // 2. Create a document record for the CSV
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ name: 'UNAI TECH Q&A Knowledge Base (CSV)', size: rows.length })
    .select()
    .single();

  if (docErr) {
    console.error('❌ Failed to create document record:', docErr.message);
    process.exit(1);
  }
  console.log(`📁 Document record created: ${doc.id}\n`);

  // 3. Embed each Q&A pair and store in document_sections
  let success = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Combine category + question + answer into one rich text chunk
    const text = `[${row.category}] Q: ${row.question} A: ${row.answer}`;
    process.stdout.write(`⚡ Embedding row ${i + 1}/${rows.length} (${row.category})...`);

    try {
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      const { error: insErr } = await supabase
        .from('document_sections')
        .insert({ document_id: doc.id, content: text, embedding });

      if (insErr) {
        console.log(` ❌ ${insErr.message}`);
      } else {
        console.log(' ✅');
        success++;
      }
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! ${success}/${rows.length} Q&A pairs indexed in Supabase.`);
  console.log('🤖 Your chatbot can now answer questions from the CSV knowledge base!');
}

main().catch(console.error);
