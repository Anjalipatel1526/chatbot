import axios from 'axios';
import { useSettingsStore } from '@/store/settingsStore';

// Create an axios instance
const api = axios.create();

// FastAPI backend base URL (set in .env as VITE_API_BASE_URL)
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Interceptor to dynamically set URL and headers on each request
api.interceptors.request.use(
  (config) => {
    const { apiKey, aiProvider } = useSettingsStore.getState();

    // Set base URL to FastAPI backend for all relative paths
    if (config.url && !config.url.startsWith('http')) {
      const cleanBase = BACKEND_URL.replace(/\/$/, '');
      const cleanUrl = config.url.replace(/^\//, '');
      config.url = `${cleanBase}/${cleanUrl}`;
    }

    // Set authorization headers dynamically based on AI provider
    if (apiKey) {
      if (aiProvider === 'openai' || aiProvider === 'ollama') {
        config.headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (aiProvider === 'claude') {
        config.headers['x-api-key'] = apiKey;
        config.headers['anthropic-version'] = '2023-06-01';
      } else if (aiProvider === 'gemini') {
        config.params = { ...config.params, key: apiKey };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown network error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
