import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useUpload } from '@/hooks/useUpload';
import Modal from '../shared/Modal';
import DropZone from './DropZone';

export const UploadModal: React.FC = () => {
  const { uploadModalOpen, openUpload } = useUIStore();
  const { uploadFile, error } = useUpload();

  const handleFileSelect = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      uploadFile(files[i]).catch((err) => {
        console.error('Failed to upload file', err);
      });
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
      </div>
    </Modal>
  );
};

export default UploadModal;
