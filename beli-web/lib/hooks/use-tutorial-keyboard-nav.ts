'use client';

import { useEffect, useCallback } from 'react';

interface UseTutorialKeyboardNavOptions {
  onNext: () => void;
  onBack?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

/**
 * Hook for tutorial keyboard navigation
 * - ArrowRight/Enter: Navigate to next tutorial step
 * - ArrowLeft: Navigate to previous tutorial step
 * - Escape: Close modals or exit tutorial
 */
export function useTutorialKeyboardNav({
  onNext,
  onBack,
  onEscape,
  enabled = true,
}: UseTutorialKeyboardNavOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle keyboard events when user is typing in input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'Enter':
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          if (onBack) {
            event.preventDefault();
            onBack();
          }
          break;
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
      }
    },
    [onNext, onBack, onEscape]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
