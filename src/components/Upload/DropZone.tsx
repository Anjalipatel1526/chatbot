import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (files: FileList) => void;
  allowedExtensions: string[];
  maxSizeMB: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelect,
  allowedExtensions,
  maxSizeMB,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateFiles = (files: FileList): boolean => {
    setError(null);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (!allowedExtensions.includes(extension)) {
        setError(`File type not supported: .${extension}. Allowed: ${allowedExtensions.join(', ').toUpperCase()}`);
        return false;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds maximum size of ${maxSizeMB}MB: ${file.name}`);
        return false;
      }
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (validateFiles(e.dataTransfer.files)) {
        onFileSelect(e.dataTransfer.files);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      if (validateFiles(e.target.files)) {
        onFileSelect(e.target.files);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`w-full min-h-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 relative ${
          isDragActive
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border bg-black/10 hover:border-accent/40 hover:bg-white/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          accept={allowedExtensions.map(ext => `.${ext}`).join(',')}
          className="hidden"
        />

        <div className="p-3 bg-white/5 rounded-full mb-3 text-textSecondary group-hover:text-accent transition-colors">
          <UploadCloud size={28} className="text-textSecondary" />
        </div>

        <div className="text-sm font-semibold text-textPrimary">
          Drag & Drop files here, or <span className="text-accent hover:underline">browse</span>
        </div>
        <p className="text-xs text-textSecondary/60 mt-1.5 leading-relaxed">
          Supports PDF, DOCX, TXT, MD, and HTML files up to {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DropZone;
