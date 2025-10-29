import * as React from "react"
import { Calendar, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function ReservationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/feed">
              <ChevronLeft className="h-6 w-6 text-secondary hover:text-foreground transition-colors" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Your Reservations</h1>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            No Reservations Yet
          </h2>

          <p className="text-base text-secondary max-w-md mx-auto mb-6">
            This feature is coming soon! You&apos;ll be able to view and manage your restaurant reservations, claim shared reservations from the community, and share your own reservations here.
          </p>

          <div className="inline-flex flex-col items-start bg-gray-50 rounded-lg p-4 text-left max-w-sm mx-auto">
            <p className="text-sm font-semibold text-foreground mb-2">Coming Soon:</p>
            <ul className="text-sm text-secondary space-y-1">
              <li>• View upcoming reservations</li>
              <li>• Claim shared reservations</li>
              <li>• Share reservations you can&apos;t use</li>
              <li>• Priority access for active members</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
