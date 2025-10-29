"use client"

import * as React from "react"
import { ChevronLeft, MoreVertical } from "lucide-react"
import { CircularBadge } from "@/components/challenge/circular-badge"
import { ChallengeProgressCard } from "@/components/challenge/challenge-progress-card"
import { ChallengeActivityCard } from "@/components/challenge/challenge-activity-card"
import { useUser } from "@/lib/hooks/use-user"
import Link from "next/link"

export default function ChallengePage() {
  const { data: user, isLoading } = useUser("1")
  const [showStickyHeader, setShowStickyHeader] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 150)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-secondary">Loading...</p>
      </div>
    )
  }

  const challenge = user.stats.challenge2025
  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-secondary">No challenge data available</p>
      </div>
    )
  }

  const now = new Date()
  const endDate = new Date(challenge.endDate)
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  // Mock activity data - in a real app, this would come from the API
  const activities = [
    {
      month: "JANUARY 2025",
      items: [
        {
          userAvatar: user.avatar,
          userName: user.username,
          restaurantName: "Carbone",
          cuisine: "Italian",
          neighborhood: "Greenwich Village",
          rating: 9.2,
          notes: "The spicy rigatoni was incredible. Best Italian in NYC.",
          date: "January 15",
        },
        {
          userAvatar: user.avatar,
          userName: user.username,
          restaurantName: "Le Bernardin",
          cuisine: "French Seafood",
          neighborhood: "Midtown",
          rating: 9.5,
          notes: "Impeccable service and the tasting menu was outstanding.",
          date: "January 8",
        },
      ],
    },
    {
      month: "DECEMBER 2024",
      items: [
        {
          userAvatar: user.avatar,
          userName: user.username,
          restaurantName: "Masa",
          cuisine: "Japanese",
          neighborhood: "Midtown",
          rating: 9.8,
          date: "December 28",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header (appears on scroll) */}
      {showStickyHeader && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/feed">
              <ChevronLeft className="h-6 w-6 text-secondary hover:text-foreground transition-colors" />
            </Link>
            <h1 className="text-lg font-semibold text-foreground truncate">2025 Restaurant Challenge</h1>
            <button className="p-2">
              <MoreVertical className="h-5 w-5 text-secondary" />
            </button>
          </div>
        </div>
      )}

      {/* Teal Header Section */}
      <div className="bg-primary text-white relative pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <Link href="/feed">
              <ChevronLeft className="h-6 w-6 text-white hover:opacity-80 transition-opacity" />
            </Link>
            <span className="text-xl font-semibold">beli</span>
            <button className="p-2">
              <MoreVertical className="h-5 w-5 text-white" />
            </button>
          </div>

          <h1 className="text-3xl font-bold text-center mb-4">
            2025 Restaurant Challenge
          </h1>
        </div>
      </div>

      {/* Circular Badge (overlapping header/content) */}
      <div className="relative -mt-20 flex justify-center mb-6">
        <CircularBadge year={challenge.year} />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* Progress Card */}
        <div className="mb-8">
          <ChallengeProgressCard
            currentCount={challenge.currentCount}
            goalCount={challenge.goalCount}
            daysLeft={daysLeft}
          />
        </div>

        {/* Monthly Timeline */}
        <div className="space-y-0">
          {activities.map((monthData) => (
            <div key={monthData.month}>
              {/* Month Header */}
              <div className="bg-gray-200 px-4 py-2 sticky top-0 z-10">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  {monthData.month}
                </h2>
              </div>

              {/* Activity Cards */}
              <div className="bg-white border-b border-gray-200 shadow-sm">
                {monthData.items.map((activity, index) => (
                  <ChallengeActivityCard
                    key={index}
                    {...activity}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no activities for current month) */}
        {challenge.currentCount === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              Start your challenge!
            </p>
            <p className="text-sm text-secondary">
              Visit and rate your first restaurant to begin tracking your 2025 progress.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
