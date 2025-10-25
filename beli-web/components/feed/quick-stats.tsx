'use client';

import { Card, CardContent } from '@/components/ui/card';

interface QuickStatsProps {
  beenCount: number;
  wantToTryCount: number;
  currentStreak: number;
  rank: number;
}

export function QuickStats({
  beenCount = 0,
  wantToTryCount = 0,
  currentStreak = 0,
  rank = 0,
}: QuickStatsProps) {
  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-primary">{beenCount}</div>
            <div className="text-xs text-muted">Been</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{wantToTryCount}</div>
            <div className="text-xs text-muted">Want to Try</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-streak">{currentStreak}</div>
            <div className="text-xs text-muted">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">#{rank}</div>
            <div className="text-xs text-muted">Rank</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
