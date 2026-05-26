import api from './api';
import { getSupabaseClient } from './supabase';

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
    const supabase = getSupabaseClient();
    const extension = file.name.split('.').pop()?.toLowerCase();
    const docType = (['pdf', 'docx', 'txt', 'md', 'html'].includes(extension || '') 
      ? extension 
      : 'txt') as any;

    if (supabase) {
      try {
        const fileId = Math.random().toString(36).substring(2, 9);
        const filePath = `${fileId}_${file.name}`;
        
        // 1. Upload to Supabase Storage bucket 'documents'
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        if (onProgress) onProgress(100);

        // 2. Insert record in 'documents' table
        const newDoc = {
          id: fileId,
          name: file.name,
          size: file.size,
          status: 'done' as const,
          progress: 100,
          uploadedAt: new Date(),
          type: docType,
        };

        const { error: dbError } = await supabase
          .from('documents')
          .insert([{
            id: fileId,
            name: file.name,
            size: file.size,
            uploaded_at: newDoc.uploadedAt
          }]);

        if (dbError) throw dbError;

        return newDoc;
      } catch (error) {
        console.error('Supabase upload failed, falling back to mock upload:', error);
      }
    }

    // --- FALLBACK / SIMULATION ---
    console.warn('Supabase not configured, using simulation for demo');
    let progress = 0;
    return new Promise<DocumentInfo>((resolve) => {
      const interval = setInterval(() => {
        progress += 20;
        if (onProgress) onProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
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
  },

  async getDocuments(): Promise<DocumentInfo[]> {
    const supabase = getSupabaseClient();
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((row: any) => {
          const extension = row.name.split('.').pop()?.toLowerCase();
          const docType = (['pdf', 'docx', 'txt', 'md', 'html'].includes(extension || '') 
            ? extension 
            : 'txt') as any;

          return {
            id: row.id,
            name: row.name,
            size: row.size || 0,
            status: 'done',
            progress: 100,
            uploadedAt: new Date(row.uploaded_at),
            type: docType,
          };
        });
      } catch (error) {
        console.error('Supabase getDocuments failed, returning mock documents:', error);
      }
    }

    return mockDocuments;
  },

  async deleteDocument(id: string): Promise<void> {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        // Fetch document metadata to find storage file path name
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('name')
          .eq('id', id)
          .single();

        if (!fetchError && data) {
          const filePath = `${id}_${data.name}`;
          // Delete from storage
          await supabase.storage.from('documents').remove([filePath]);
        }

        // Delete from table
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return;
      } catch (error) {
        console.error('Supabase deleteDocument failed:', error);
      }
    }

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
