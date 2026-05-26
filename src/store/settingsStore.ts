import { create } from 'zustand';

type AIProvider = 'openai' | 'ollama' | 'claude' | 'gemini';
type Theme = 'dark' | 'light' | 'system';

interface SettingsStore {
  aiProvider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  theme: Theme;
  setProvider: (provider: AIProvider) => void;
  setSetting: (key: string, value: any) => void;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme') as Theme;
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'light';
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  aiProvider: (localStorage.getItem('aiProvider') as AIProvider) || 'openai',
  apiKey: localStorage.getItem('apiKey') || '',
  model: localStorage.getItem('model') || 'gpt-4o',
  baseUrl: localStorage.getItem('baseUrl') || 'https://api.openai.com/v1',
  temperature: Number(localStorage.getItem('temperature')) || 0.7,
  theme: getInitialTheme(),

  setProvider: (provider) => {
    localStorage.setItem('aiProvider', provider);
    // Set sensible defaults for each provider
    let defaultModel = 'gpt-4o';
    let defaultUrl = 'https://api.openai.com/v1';
    
    if (provider === 'ollama') {
      defaultModel = 'llama3';
      defaultUrl = 'http://localhost:11434';
    } else if (provider === 'claude') {
      defaultModel = 'claude-3-5-sonnet-latest';
      defaultUrl = 'https://api.anthropic.com/v1';
    } else if (provider === 'gemini') {
      defaultModel = 'gemini-1.5-pro';
      defaultUrl = 'https://generativelanguage.googleapis.com/v1beta';
    }

    localStorage.setItem('model', defaultModel);
    localStorage.setItem('baseUrl', defaultUrl);

    set({ 
      aiProvider: provider, 
      model: defaultModel, 
      baseUrl: defaultUrl 
    });
  },

  setSetting: (key, value) => {
    localStorage.setItem(key, String(value));
    set({ [key]: value });
    
    if (key === 'theme') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (value === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(value);
      }
    }
  },
}));
