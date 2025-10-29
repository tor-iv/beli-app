import * as React from "react"

interface ChallengeProgressCardProps {
  currentCount: number
  goalCount: number
  daysLeft: number
}

export function ChallengeProgressCard({
  currentCount,
  goalCount,
  daysLeft,
}: ChallengeProgressCardProps) {
  const progress = Math.min((currentCount / goalCount) * 100, 100)

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-3xl font-bold text-primary">{currentCount}</span>
          <span className="text-lg text-secondary ml-1">of {goalCount}</span>
          <span className="text-lg text-foreground ml-1">restaurants</span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground">{daysLeft}</p>
          <p className="text-sm text-secondary">days left</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
