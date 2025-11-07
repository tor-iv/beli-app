import * as React from 'react';

interface ChallengeProgressCardProps {
  currentCount: number;
  goalCount: number;
  daysLeft: number;
}

export const ChallengeProgressCard = ({
  currentCount,
  goalCount,
  daysLeft,
}: ChallengeProgressCardProps) => {
  const progress = Math.min((currentCount / goalCount) * 100, 100);

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-bold text-primary">{currentCount}</span>
          <span className="ml-1 text-lg text-secondary">of {goalCount}</span>
          <span className="ml-1 text-lg text-foreground">restaurants</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground">{daysLeft}</p>
          <p className="text-sm text-secondary">days left</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
