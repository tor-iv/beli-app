'use client';

import { Users, Utensils, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { WhatToOrderModal } from '@/components/modals/what-to-order-modal';
import { TutorialBanner } from '@/components/tutorial/tutorial-banner';
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay';
import { demoRestaurant } from '@/lib/demo-data';
import { useTutorialKeyboardNav } from '@/lib/hooks/use-tutorial-keyboard-nav';

export default function WhatToOrderTutorialPage() {
  const router = useRouter();
  const [showModal, setShowModal] = React.useState(false);

  const handleBack = React.useCallback(() => {
    router.push('/tutorial/group-dinner');
  }, [router]);

  const handleNext = React.useCallback(() => {
    router.push('/tutorial/tastemakers');
  }, [router]);

  const handleOpenModal = React.useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setShowModal(false);
  }, []);

  // Keyboard navigation
  useTutorialKeyboardNav({
    onNext: handleNext,
    onBack: handleBack,
    onEscape: handleCloseModal,
  });

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-32 md:pb-4">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="What to Order"
        description="Analyzes your group's past ratings and favorite dishes to recommend the perfect order based on party size and hunger level"
      />

      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8">
          <div className="text-center">
            <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">What to Order</h1>
            <p className="mx-auto mb-6 max-w-2xl text-base text-gray-600 md:text-lg">
              Get personalized menu recommendations based on your group's preferences and appetite.
            </p>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary/90"
            >
              <Sparkles className="h-5 w-5" />
              <span>Try It Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl flex-1 px-4 py-8">
        {/* How It Works Section */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-card md:p-8">
          <h3 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">How It Works</h3>

          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span>Analyzes your group's past ratings and favorite dishes</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span>Adjusts portions based on party size and hunger level</span>
            </li>
            <li className="flex items-start gap-3">
              <Utensils className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
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
  );
}
