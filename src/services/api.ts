import axios from 'axios';
import { useSettingsStore } from '@/store/settingsStore';

// Create an axios instance
const api = axios.create();

// Interceptor to dynamically set URL and headers on each request
api.interceptors.request.use(
  (config) => {
    const { baseUrl, apiKey, aiProvider } = useSettingsStore.getState();
    
    // Set base URL from state if not already set as fully absolute path
    if (config.url && !config.url.startsWith('http')) {
      // Remove trailing slash from baseUrl and leading slash from config.url
      const cleanBase = baseUrl.replace(/\/$/, '');
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
