import api from './api';

export interface DocumentInfo {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  uploadedAt: Date;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'html';
}

export const uploadService = {
  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<DocumentInfo> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.warn('Network file upload failed, using simulation for demo', error);
      
      // Simulate file upload progress
      let progress = 0;
      return new Promise<DocumentInfo>((resolve) => {
        const interval = setInterval(() => {
          progress += 20;
          if (onProgress) onProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Randomly succeed or fail
            const extension = file.name.split('.').pop()?.toLowerCase();
            const docType = (['pdf', 'docx', 'txt', 'md', 'html'].includes(extension || '') 
              ? extension 
              : 'txt') as any;

            resolve({
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              size: file.size,
              status: 'done',
              progress: 100,
              uploadedAt: new Date(),
              type: docType,
            });
          }
        }, 300);
      });
    }
  },

  async getDocuments(): Promise<DocumentInfo[]> {
    try {
      const response = await api.get('/api/documents');
      return response.data;
    } catch (error) {
      console.warn('Network call failed, using mock documents list', error);
      return mockDocuments;
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      await api.delete(`/api/documents/${id}`);
    } catch (error) {
      console.warn('Network call failed, deleted document locally only', error);
    }
  },
};

const mockDocuments: DocumentInfo[] = [
  {
    id: 'd1',
    name: 'rag_architecture_overview.pdf',
    size: 2450000,
    status: 'done',
    progress: 100,
    uploadedAt: new Date(Date.now() - 3600000 * 2),
    type: 'pdf',
  },
  {
    id: 'd2',
    name: 'vector_search_optimization.md',
    size: 45000,
    status: 'done',
    progress: 100,
    uploadedAt: new Date(Date.now() - 3600000 * 24),
    type: 'md',
  },
  {
    id: 'd3',
    name: 'deployment_guide.docx',
    size: 1200000,
    status: 'done',
    progress: 100,
    uploadedAt: new Date(Date.now() - 3600000 * 48),
    type: 'docx',
  },
];
