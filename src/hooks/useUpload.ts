import { useState, useCallback, useEffect } from 'react';
import { uploadService } from '@/services/uploadService';
import type { DocumentInfo } from '@/services/uploadService';

export const useUpload = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents on mount
  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await uploadService.getDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = useCallback(async (file: File) => {
    // 1. Validation
    const allowedExtensions = ['pdf', 'docx', 'txt', 'md', 'html'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`Unsupported file type: .${fileExtension}. Supported: PDF, DOCX, TXT, MD, HTML`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File exceeds maximum size of 10MB');
    }

    // 2. Add temporary document to list with uploading status
    const tempId = Math.random().toString(36).substring(2, 9);
    const tempDoc: DocumentInfo = {
      id: tempId,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      uploadedAt: new Date(),
      type: fileExtension as any,
    };

    setDocuments((prev) => [tempDoc, ...prev]);
    setIsUploading(true);

    try {
      const uploadedDoc = await uploadService.uploadFile(file, (progress) => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === tempId ? { ...d, status: 'processing', progress } : d))
        );
      });

      // Update with final document data from server
      setDocuments((prev) =>
        prev.map((d) => (d.id === tempId ? uploadedDoc : d))
      );
      return uploadedDoc;
    } catch (err: any) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === tempId ? { ...d, status: 'error', progress: 0 } : d))
      );
      throw new Error(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      await uploadService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  }, []);

  return {
    documents,
    isUploading,
    error,
    uploadFile,
    deleteDocument,
    refreshDocuments: fetchDocuments,
  };
};
