import React, { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { formatRelativeTime } from '@/utils/formatters';

interface SidebarItemProps {
  id: string;
  title: string;
  updatedAt: Date | string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  title,
  updatedAt,
  isActive,
  onSelect,
  onDelete,
}) => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      className={`group relative flex items-center justify-between cursor-pointer py-3 transition-all duration-150 border-l-2 ${
        isActive
          ? 'bg-white/5 border-accent text-textPrimary animate-pulse-glow'
          : 'border-transparent text-textSecondary hover:bg-white/5 hover:text-textPrimary hover:border-accent-hover'
      } ${sidebarOpen ? 'px-4 gap-3' : 'px-0 justify-center'}`}
    >
      {/* Icon and Title */}
      <div className="flex items-center gap-3 min-w-0">
        <MessageSquare size={18} className={isActive ? 'text-accent' : 'text-textSecondary'} />
        {sidebarOpen && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate pr-2">
              {title}
            </span>
            <span className="text-xs text-textSecondary/60 mt-0.5">
              {formatRelativeTime(updatedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Delete button shown on hover */}
      {sidebarOpen && isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="p-1 hover:text-danger rounded transition-colors"
          title="Delete Chat"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};
export default SidebarItem;
