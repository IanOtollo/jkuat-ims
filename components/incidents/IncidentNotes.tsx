'use client';

import React from 'react';
import { IncidentNote } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';
import { MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface IncidentNotesProps {
  notes: IncidentNote[];
  newNote: string;
  onNoteChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const IncidentNotes = ({ notes, newNote, onNoteChange, onSubmit, isLoading }: IncidentNotesProps) => {
  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-border bg-surface-raised/30 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest text-primary font-medium flex items-center gap-2">
          <MessageSquare size={16} /> Operational Timeline
        </h3>
        <span className="text-xs text-muted font-mono">{notes.length} entries</span>
      </div>
      
      <div className="p-8 space-y-8">
        {notes.map((note) => (
          <div key={note.id} className="relative pl-8 border-l border-border pb-8 last:pb-0">
            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-accent rounded-full" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{note.author?.full_name || 'System'}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted border border-border px-1.5">{note.author?.role}</span>
              </div>
              <span className="text-[10px] font-mono text-muted">{formatDate(note.created_at)}</span>
            </div>
            <p className="text-sm text-primary/80 leading-relaxed">{note.content}</p>
          </div>
        ))}

        <form onSubmit={onSubmit} className="pt-4 border-t border-border mt-8">
          <Textarea 
            placeholder="Enter operational update or observation..." 
            value={newNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onNoteChange(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={isLoading}>
              Post Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
