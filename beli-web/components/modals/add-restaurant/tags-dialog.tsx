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
import { Chip } from '@/components/ui/chip';

// Predefined tag options organized by category
const TAG_OPTIONS = {
  occasion: {
    label: 'Occasion',
    tags: ['Date Night', 'Business', 'Family', 'Celebration', 'Solo'],
  },
  vibe: {
    label: 'Vibe',
    tags: ['Casual', 'Upscale', 'Cozy', 'Trendy', 'Loud', 'Quiet'],
  },
  value: {
    label: 'Value',
    tags: ['Good Value', 'Worth the Splurge', 'Overpriced'],
  },
  experience: {
    label: 'Experience',
    tags: ['Great Service', 'Good for Groups', 'Quick Bite', 'Outdoor Seating'],
  },
} as const;

interface TagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: string[];
  onSave: (tags: string[]) => void;
}

export function TagsDialog({ open, onOpenChange, tags, onSave }: TagsDialogProps) {
  const [selectedTags, setSelectedTags] = React.useState<string[]>(tags);

  // Sync with external tags when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedTags(tags);
    }
  }, [open, tags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave(selectedTags);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedTags(tags); // Reset to original
    onOpenChange(false);
  };

  const handleClear = () => {
    setSelectedTags([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Labels</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] space-y-5 overflow-y-auto py-4">
          {Object.entries(TAG_OPTIONS).map(([key, category]) => (
            <div key={key}>
              <h4 className="mb-2.5 text-sm font-medium text-secondary">{category.label}</h4>
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    variant="filter"
                    size="medium"
                    selected={selectedTags.includes(tag)}
                    onPress={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-secondary"
            disabled={selectedTags.length === 0}
          >
            Clear all
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
