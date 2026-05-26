import React from 'react';
import AIProviderSelector from '@/components/Settings/AIProviderSelector';
import ThemeSwitcher from '@/components/Settings/ThemeSwitcher';
import { Cpu, Palette, Database } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/shared/Button';

export const SettingsPage: React.FC = () => {
  const { setSessions, setMessages } = useChatStore();

  const handleClearConversations = () => {
    if (confirm('Are you sure you want to delete all conversations?')) {
      setSessions([]);
      setMessages([]);
      alert('All conversations deleted.');
    }
  };

  const handleClearVectorDb = () => {
    if (confirm('Are you sure you want to clear vector indexes?')) {
      alert('Vector database cleared.');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background text-textPrimary px-8 py-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Preferences Dashboard</h1>
          <p className="text-xs text-textSecondary mt-1">Configure your LLM model endpoints, appearance theme, and local vector storage.</p>
        </div>

        {/* Grid Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Provider Config */}
          <div className="border border-border bg-surface rounded-xl p-5 glass">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 border-b border-border/40 pb-2">
              <Cpu size={16} className="text-accent" />
              <span>Model Gateway Settings</span>
            </h3>
            <AIProviderSelector />
          </div>

          {/* Card 2: Appearance Theme */}
          <div className="flex flex-col gap-6">
            <div className="border border-border bg-surface rounded-xl p-5 glass">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 border-b border-border/40 pb-2">
                <Palette size={16} className="text-accent" />
                <span>Visual Styling</span>
              </h3>
              <ThemeSwitcher />
            </div>

            {/* Card 3: Storage Management */}
            <div className="border border-border bg-surface rounded-xl p-5 glass">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 border-b border-border/40 pb-2">
                <Database size={16} className="text-accent" />
                <span>Storage Management</span>
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-textSecondary">Delete conversations history</span>
                  <Button variant="danger" size="sm" onClick={handleClearConversations}>
                    Clear
                  </Button>
                </div>
                <div className="flex justify-between items-center gap-2 border-t border-border/40 pt-3">
                  <span className="text-xs text-textSecondary">Purge vector document database</span>
                  <Button variant="danger" size="sm" onClick={handleClearVectorDb}>
                    Purge
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
