import React, { useState } from 'react';
import { Cpu, Palette, Database, Info, Trash2, ArrowUpRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import Modal from '../shared/Modal';
import AIProviderSelector from './AIProviderSelector';
import ThemeSwitcher from './ThemeSwitcher';
import { Button } from '../shared/Button';

type ActiveTab = 'general' | 'provider' | 'appearance' | 'data';

export const SettingsModal: React.FC = () => {
  const { settingsModalOpen, openSettings } = useUIStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const { sessions, setSessions, setMessages } = useChatStore();

  const handleClearConversations = () => {
    if (confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
      setSessions([]);
      setMessages([]);
      alert('All chat history cleared.');
    }
  };

  const handleClearVectorDb = () => {
    if (confirm('Are you sure you want to wipe the local vector database? All uploaded document knowledge will be purged.')) {
      // Mocking vector db deletion
      alert('Vector database cleared successfully.');
    }
  };

  const handleExportData = () => {
    const data = {
      sessions,
      settings: {
        provider: localStorage.getItem('aiProvider'),
        model: localStorage.getItem('model'),
        temperature: localStorage.getItem('temperature'),
      },
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docmind_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Info size={16} /> },
    { id: 'provider', label: 'AI Provider', icon: <Cpu size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={16} /> },
  ] as const;

  return (
    <Modal
      isOpen={settingsModalOpen}
      onClose={() => openSettings(false)}
      title="System Settings"
      size="xl"
    >
      <div className="flex flex-col sm:flex-row gap-6 min-h-[380px]">
        
        {/* Left Side Tab Links */}
        <div className="flex sm:flex-col gap-1 flex-shrink-0 sm:w-48 overflow-x-auto sm:overflow-x-visible border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 sm:pr-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors w-full text-left ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-textSecondary hover:bg-white/5 hover:text-textPrimary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Tab Window */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-semibold text-textPrimary">About Unai Chatbox</h4>
                <p className="text-xs text-textSecondary mt-1 leading-relaxed">
                  Unai Chatbox is a client-side Electron RAG frontend for document-guided answering.
                  Build complex queries directly on top of your local index or cloud databases.
                </p>
              </div>

              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textSecondary">App Version</span>
                  <span className="font-mono text-textPrimary">v1.2.0-beta</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textSecondary">Status</span>
                  <span className="text-success font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textSecondary">Vector DB Nodes</span>
                  <span className="font-mono text-textPrimary">3 active collections</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AI Provider */}
          {activeTab === 'provider' && <AIProviderSelector />}

          {/* Tab 3: Appearance */}
          {activeTab === 'appearance' && <ThemeSwitcher />}

          {/* Tab 4: Data */}
          {activeTab === 'data' && (
            <div className="flex flex-col gap-6">
              {/* Clear History */}
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-textPrimary">Clear Conversations</span>
                  <span className="text-[11px] text-textSecondary mt-0.5">Delete all local chat history.</span>
                </div>
                <Button variant="danger" size="sm" onClick={handleClearConversations}>
                  <Trash2 size={12} className="mr-1" /> Clear
                </Button>
              </div>

              {/* Reset Vector Index */}
              <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-textPrimary">Purge Vector Indexes</span>
                  <span className="text-[11px] text-textSecondary mt-0.5">Wipe the document parsing database files.</span>
                </div>
                <Button variant="danger" size="sm" onClick={handleClearVectorDb}>
                  <Trash2 size={12} className="mr-1" /> Purge
                </Button>
              </div>

              {/* Backup configuration */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-textPrimary">Backup and Export</span>
                  <span className="text-[11px] text-textSecondary mt-0.5">Download configurations and conversations backup.</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <ArrowUpRight size={12} className="mr-1" /> Export
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
