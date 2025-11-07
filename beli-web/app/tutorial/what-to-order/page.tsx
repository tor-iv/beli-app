'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Users, Utensils, Sparkles } from 'lucide-react'
import { WhatToOrderModal } from '@/components/modals/what-to-order-modal'
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay'
import { TutorialBanner } from '@/components/tutorial/tutorial-banner'
import { demoRestaurant } from '@/lib/demo-data'

export default function WhatToOrderTutorialPage() {
  const router = useRouter()
  const [showModal, setShowModal] = React.useState(false)

  const handleBack = React.useCallback(() => {
    router.push('/tutorial/group-dinner')
  }, [router])

  const handleNext = React.useCallback(() => {
    router.push('/tutorial/tastemakers')
  }, [router])

  const handleOpenModal = React.useCallback(() => {
    setShowModal(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32 md:pb-4">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="What to Order"
        description="Analyzes your group's past ratings and favorite dishes to recommend the perfect order based on party size and hunger level"
      />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              What to Order
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Get personalized menu recommendations based on your group's preferences and appetite.
            </p>
            <button
              onClick={handleOpenModal}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Try It Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h3>

          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Analyzes your group's past ratings and favorite dishes</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Adjusts portions based on party size and hunger level</span>
            </li>
            <li className="flex items-start gap-3">
              <Utensils className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>Balances variety across appetizers, mains, sides, and desserts</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        currentStep={2}
        totalSteps={3}
        featureName="What to Order"
        onBack={handleBack}
        onNext={handleNext}
      />

      {/* What to Order Modal */}
      {showModal && (
        <WhatToOrderModal
          open={showModal}
          onOpenChange={setShowModal}
          restaurant={demoRestaurant}
        />
      )}
    </div>
  )
}
