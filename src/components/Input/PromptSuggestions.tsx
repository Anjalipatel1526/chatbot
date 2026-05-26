import React from 'react';
import { BookOpen, Code, Settings, FileSearch } from 'lucide-react';

interface Suggestion {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelect }) => {
  const suggestions: Suggestion[] = [
    {
      icon: <BookOpen size={18} className="text-accent" />,
      label: 'Summarize Document Architecture',
      prompt: 'Summarize the core system architecture details found in the documents, listing key databases and servers.',
    },
    {
      icon: <FileSearch size={18} className="text-emerald-400" />,
      label: 'Analyze Vector Embeddings Settings',
      prompt: 'What are the configured embedding dimensions, MRR scores, and search metrics documented in the vector DB guide?',
    },
    {
      icon: <Code size={18} className="text-amber-400" />,
      label: 'Cosine Similarity Implementation',
      prompt: 'Show me the TypeScript code calculation for Cosine Similarity used in semantic retrieval.',
    },
    {
      icon: <Settings size={18} className="text-indigo-400" />,
      label: 'Verify Deployment Steps',
      prompt: 'What checks are necessary to synchronize Elasticsearch and ChromaDB before running the production build?',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-textPrimary">How can I help you today?</h2>
        <p className="text-xs text-textSecondary mt-1">Select a suggestion or type your own question below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((s, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(s.prompt)}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-white/5 cursor-pointer transition-all duration-150 active:scale-[0.99] glass group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-accent/10 transition-colors">
              {s.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-textPrimary truncate">{s.label}</span>
              <span className="text-[11px] text-textSecondary mt-1 line-clamp-2 leading-relaxed">
                {s.prompt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
