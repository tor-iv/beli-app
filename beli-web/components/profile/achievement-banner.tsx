'use client';

import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AchievementBannerProps {
  emoji: string;
  text: string;
  progress?: number; // 0-1
  daysLeft?: number;
  onSetNewGoal?: () => void;
}

export function AchievementBanner({
  emoji,
  text,
  progress = 1,
  daysLeft,
  onSetNewGoal,
}: AchievementBannerProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{emoji}</span>
          <p className="text-lg text-gray-900 flex-1">{text}</p>
        </div>

        {progress !== undefined && (
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          {daysLeft !== undefined && (
            <span className="text-base text-gray-900">{daysLeft} days left</span>
          )}
          {onSetNewGoal && (
            <Button
              variant="ghost"
              onClick={onSetNewGoal}
              className="text-primary hover:text-primary/90 p-0 h-auto gap-1"
            >
              <span className="font-medium">Set a new goal</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
