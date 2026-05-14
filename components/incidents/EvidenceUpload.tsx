'use client';

import React from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EvidenceUploadProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export const EvidenceUpload = ({ files, onFileChange, onRemove }: EvidenceUploadProps) => {
  return (
    <div className="card p-8 space-y-6">
      <h2 className="text-lg font-display font-medium text-primary pb-4 border-b border-border">Evidence & Documentation</h2>
      
      <div className="border-2 border-dashed border-border p-8 text-center bg-surface-raised/50 group hover:border-accent transition-colors">
        <Upload size={32} className="mx-auto text-muted mb-4 group-hover:text-accent" />
        <p className="text-sm text-primary font-medium mb-1">Click to upload or drag files</p>
        <p className="text-xs text-muted mb-6">Images, Videos, or PDF documents (Max 10MB each)</p>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          id="file-upload" 
          onChange={onFileChange}
        />
        <Button 
          type="button" 
          variant="secondary" 
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Select Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">Selected Files ({files.length})</p>
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface border border-border">
              <div className="flex items-center gap-3 overflow-hidden">
                {file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                <span className="text-xs text-primary truncate">{file.name}</span>
              </div>
              <button type="button" onClick={() => onRemove(i)} className="text-muted hover:text-destructive">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
