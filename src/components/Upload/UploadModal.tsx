import React from 'react';
import { Trash2, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useUpload } from '@/hooks/useUpload';
import Modal from '../shared/Modal';
import DropZone from './DropZone';
import Badge from '../shared/Badge';
import { formatBytes } from '@/utils/formatters';

export const UploadModal: React.FC = () => {
  const { uploadModalOpen, openUpload } = useUIStore();
  const { documents, uploadFile, deleteDocument, error } = useUpload();

  const handleFileSelect = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]).catch((err) => {
        console.error('Failed to upload file', err);
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={16} className="text-success" />;
      case 'processing':
        return <RefreshCw size={16} className="text-accent animate-spin" />;
      case 'error':
        return <AlertTriangle size={16} className="text-danger" />;
      default:
        return <Clock size={16} className="text-textSecondary/50" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge variant="success">Parsed</Badge>;
      case 'processing':
        return <Badge variant="info">Parsing</Badge>;
      case 'error':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <Modal
      isOpen={uploadModalOpen}
      onClose={() => openUpload(false)}
      title="Knowledge Source Uploader"
      size="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Drop Zone target */}
        <DropZone
          onFileSelect={handleFileSelect}
          allowedExtensions={['pdf', 'docx', 'txt', 'md', 'html']}
          maxSizeMB={10}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Document Processing Queue */}
        <div className="flex flex-col">
          <div className="text-xs font-bold uppercase tracking-wider text-textSecondary/50 mb-3 select-none">
            Document Repository ({documents.length} Files)
          </div>

          <div className="flex flex-col max-h-[260px] overflow-y-auto border border-border rounded-xl divide-y divide-border/60 bg-black/10">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-textSecondary/40">
                No documents uploaded yet. Add files to enable RAG answers.
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    {/* Icon and Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getStatusIcon(doc.status)}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-textPrimary truncate max-w-[260px] sm:max-w-[340px]">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-textSecondary/60 mt-0.5">
                          {formatBytes(doc.size)}
                        </span>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc.status)}
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1 hover:text-danger rounded transition-colors text-textSecondary"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Individual Upload Progress Bar */}
                  {doc.status === 'processing' && (
                    <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                      <div
                        className="bg-accent h-full transition-all duration-150"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
