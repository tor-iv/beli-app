'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Users, Utensils, Sparkles } from 'lucide-react'
import { WhatToOrderModal } from '@/components/modals/what-to-order-modal'
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay'
import { TutorialBanner } from '@/components/tutorial/tutorial-banner'
import { demoRestaurant, demoMenuItems, demoScenarios } from '@/lib/demo-data'

export default function WhatToOrderTutorialPage() {
  const router = useRouter()
  const [showModal, setShowModal] = React.useState(false)
  const [selectedScenario, setSelectedScenario] = React.useState<string | null>(null)

  const handleScenarioClick = (scenarioId: string) => {
    setSelectedScenario(scenarioId)
    setShowModal(true)
  }

  const handleBack = () => {
    router.push('/tutorial/group-dinner')
  }

  const handleNext = () => {
    router.push('/tutorial/tastemakers')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-32 md:pb-4">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="What to Order"
        description="Smart menu recommendations based on party size and hunger level"
      />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
              What to Order
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Our smart algorithm analyzes party size, hunger level, and menu data to suggest the perfect dishes for your group
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        {/* Restaurant Context Card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-8">
          <div className="relative h-48 md:h-64">
            <img
              src={demoRestaurant.images[0]}
              alt={demoRestaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {demoRestaurant.name}
              </h2>
              <div className="flex items-center gap-3 text-white/90 text-sm">
                <span>{demoRestaurant.cuisine.join(', ')}</span>
                <span>•</span>
                <span>{demoRestaurant.priceRange}</span>
                <span>•</span>
                <span>{demoRestaurant.location.neighborhood}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Classic New York pizza joint serving up delicious pies since 1975. Known for their crispy crust and generous toppings.
            </p>

            {/* Try Scenarios Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Try Different Scenarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioClick(scenario.id)}
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary/5 border-2 border-transparent hover:border-primary rounded-xl transition-all text-left group"
                  >
                    <div className="text-4xl flex-shrink-0">{scenario.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1">
                        {scenario.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {scenario.description}
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            How It Works
          </h3>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  1. Party Size Analysis
                </h4>
                <p className="text-gray-600 text-sm">
                  The algorithm calculates total servings needed based on your group size and adjusts for sharing.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  2. Hunger Level Multiplier
                </h4>
                <p className="text-gray-600 text-sm">
                  Applies a multiplier (0.75x for light, 1.0x for medium, 1.5x for very hungry) to adjust portion recommendations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  3. Smart Dish Selection
                </h4>
                <p className="text-gray-600 text-sm">
                  Balances dish variety (mains, appetizers, sides, desserts) and ensures you get great value for your group.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Order Section */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 md:p-8 text-center border-2 border-primary/20">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            Ready to Try?
          </h3>
          <p className="text-gray-600 mb-6">
            Or customize your own party size and hunger level
          </p>
          <button
            onClick={() => {
              setSelectedScenario(null)
              setShowModal(true)
            }}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Try It Yourself</span>
          </button>
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
