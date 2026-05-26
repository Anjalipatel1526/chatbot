import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Shield } from 'lucide-react';

export const AIProviderSelector: React.FC = () => {
  const {
    aiProvider,
    apiKey,
    model,
    baseUrl,
    temperature,
    setProvider,
    setSetting,
  } = useSettingsStore();

  const providers = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'ollama', name: 'Ollama (Local)' },
    { id: 'claude', name: 'Claude (Anthropic)' },
    { id: 'gemini', name: 'Gemini (Google)' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      {/* Provider Selector dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-textPrimary">AI Provider</label>
        <select
          value={aiProvider}
          onChange={(e) => setProvider(e.target.value as any)}
          className="bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id} className="bg-surface text-textPrimary">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* API Key (Show only for non-local) */}
      {aiProvider !== 'ollama' && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-textPrimary flex items-center gap-1">
              <Shield size={12} className="text-accent" />
              <span>API Secret Key</span>
            </label>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setSetting('apiKey', e.target.value)}
            placeholder={`Enter your ${aiProvider.toUpperCase()} key`}
            className="bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-accent"
          />
        </div>
      )}

      {/* Model Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-textPrimary">Model ID</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setSetting('model', e.target.value)}
          placeholder="Model identifier (e.g. gpt-4o, llama3)"
          className="bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent"
        />
      </div>

      {/* Base URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-textPrimary">Base Gateway URL</label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setSetting('baseUrl', e.target.value)}
          placeholder="API Endpoint Base URL"
          className="bg-black/20 border border-border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-accent"
        />
      </div>

      {/* Temperature Slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-textPrimary">Temperature: {temperature}</label>
          <span className="text-textSecondary/50">
            {temperature <= 0.3 ? 'Deterministic' : temperature >= 0.8 ? 'Creative' : 'Balanced'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1.2"
          step="0.1"
          value={temperature}
          onChange={(e) => setSetting('temperature', parseFloat(e.target.value))}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>
    </div>
  );
};

export default AIProviderSelector;
