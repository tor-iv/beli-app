'use client';

import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AchievementBannerProps {
  emoji: string;
  text: string;
  progress?: number; // 0-1
  daysLeft?: number;
  onSetNewGoal?: () => void;
}

export const AchievementBanner = ({
  emoji,
  text,
  progress = 1,
  daysLeft,
  onSetNewGoal,
}: AchievementBannerProps) => {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <p className="flex-1 text-lg text-gray-900">{text}</p>
        </div>

        {progress !== undefined && (
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary transition-all"
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
              className="h-auto gap-1 p-0 text-primary hover:text-primary/90"
            >
              <span className="font-medium">Set a new goal</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
