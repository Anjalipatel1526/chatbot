import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, CornerDownRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import Badge from '../shared/Badge';
import { formatPercent, truncateText } from '@/utils/formatters';

interface SearchResult {
  id: string;
  filename: string;
  content: string;
  score: number;
  docType: 'pdf' | 'docx' | 'txt' | 'md' | 'html';
  chunkIndex: number;
}

export const SearchDrawer: React.FC = () => {
  const { searchDrawerOpen, openSearch } = useUIStore();
  const { createSession, addMessage } = useChatStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulate API search query
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: 'sr1',
          filename: 'rag_architecture_overview.pdf',
          chunkIndex: 12,
          content: 'Retrieval-Augmented Generation (RAG) is an architectural approach that improves the accuracy and reliability of LLM generation by fetching facts from external reference sources before responding.',
          score: 0.95,
          docType: 'pdf',
        },
        {
          id: 'sr2',
          filename: 'vector_search_optimization.md',
          chunkIndex: 4,
          content: 'We use Cosine Similarity index in our vector DB to match user query embeddings with text chunks. Chunk overlap is configured at 20% (100 tokens) to ensure prompt context continuity.',
          score: 0.89,
          docType: 'md',
        },
        {
          id: 'sr3',
          filename: 'deployment_guide.docx',
          chunkIndex: 28,
          content: 'To deploy the hybrid query system, verify that Elasticsearch and ChromaDB are synchronized. The primary key used for linking vector records with database text nodes must be consistent.',
          score: 0.76,
          docType: 'docx',
        },
      ];
      
      setResults(
        mockResults.filter(
          (r) =>
            r.content.toLowerCase().includes(query.toLowerCase()) ||
            r.filename.toLowerCase().includes(query.toLowerCase())
        )
      );
      setIsSearching(false);
    }, 600);
  };

  const handleResultClick = (result: SearchResult) => {
    const title = `Search: ${result.filename}`;
    createSession(title);
    
    // 2. Add user search query
    const userMsg = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user' as const,
      content: `Explain this context from ${result.filename} (Chunk ${result.chunkIndex}):\n\n"${result.content}"`,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // 3. Add prompt response trigger
    const assistantMsg = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'assistant' as const,
      content: `I've pre-loaded the text snippet from **${result.filename}** (Chunk ${result.chunkIndex}).\n\nThis segment outlines:\n> ${result.content}\n\nWhat details would you like to clarify or extract from this chunk?`,
      timestamp: new Date(),
      sources: [result],
    };
    addMessage(assistantMsg);

    // 4. Close drawer
    openSearch(false);
  };

  return (
    <AnimatePresence>
      {searchDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => openSearch(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl flex flex-col z-10 glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-textPrimary">Semantic Chunk Search</h3>
              <button
                onClick={() => openSearch(false)}
                className="p-1 rounded-lg text-textSecondary hover:bg-white/5 hover:text-textPrimary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input bar */}
            <form onSubmit={handleSearch} className="p-4 border-b border-border/40">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Query semantic text vectors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black/20 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-textPrimary placeholder-textSecondary/40 focus:outline-none focus:border-accent"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-textSecondary/40" />
              </div>
            </form>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-textSecondary text-xs">
                  <svg className="animate-spin h-5 w-5 text-accent mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Searching vector spaces...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 text-textSecondary/40 text-xs leading-relaxed">
                  {query ? 'No semantic results found.' : 'Enter a query above to scan index files.'}
                </div>
              ) : (
                results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="group border border-border bg-black/10 hover:border-accent/40 rounded-xl p-3.5 cursor-pointer transition-all duration-150 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText size={12} className="text-accent flex-shrink-0" />
                        <span className="font-semibold text-textPrimary truncate">{result.filename}</span>
                        <Badge variant="neutral">{result.docType}</Badge>
                      </div>
                      <span className="text-accent font-bold flex-shrink-0">
                        {formatPercent(result.score)} Match
                      </span>
                    </div>

                    <p className="text-[11px] text-textSecondary leading-relaxed line-clamp-3 mb-2 font-mono">
                      {truncateText(result.content, 180)}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <CornerDownRight size={10} />
                      <span>Start chat with this context</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchDrawer;
