'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: string;
  onSave: (notes: string) => void;
}

export function NotesDialog({ open, onOpenChange, notes, onSave }: NotesDialogProps) {
  const [localNotes, setLocalNotes] = React.useState(notes);

  // Sync with external notes when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalNotes(notes);
    }
  }, [open, notes]);

  const handleSave = () => {
    onSave(localNotes);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalNotes(notes); // Reset to original
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Notes</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="What did you think? Any memorable dishes, service notes, or recommendations for others?"
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            className="min-h-[150px] resize-none"
            autoFocus
          />
          <p className="mt-2 text-right text-xs text-secondary">
            {localNotes.length} characters
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
