import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl border border-border bg-surface-raised animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-xl font-display font-medium text-primary">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
