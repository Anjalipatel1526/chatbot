import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import Badge from '../shared/Badge';
import { formatPercent } from '@/utils/formatters';
import type { SourceChunk } from '@/types';

interface SourceCardProps {
  source: SourceChunk;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getBadgeVariant = (type: string) => {
    if (type === 'pdf') return 'danger';
    if (type === 'docx') return 'info';
    if (type === 'md') return 'success';
    if (type === 'html') return 'warning';
    return 'neutral';
  };

  return (
    <div className="border border-border bg-slate-950/30 rounded-lg overflow-hidden transition-all duration-150 hover:border-white/10 hover:bg-slate-950/50">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-3 cursor-pointer select-none text-xs gap-4"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-accent/80 flex-shrink-0" />
          <span className="font-medium text-textPrimary truncate" title={source.filename}>
            {source.filename}
          </span>
          <Badge variant={getBadgeVariant(source.docType)}>{source.docType}</Badge>
          <span className="text-textSecondary/50 font-mono text-[10px] hidden sm:inline">Chunk {source.chunkIndex}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-semibold text-accent/90 bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
            {formatPercent(source.score)} Match
          </span>
          <div className="text-textSecondary">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Snippet text */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="border-t border-border/40 p-3 bg-black/20 text-xs text-textSecondary leading-relaxed whitespace-pre-wrap">
              {source.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SourceCard;
