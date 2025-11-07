"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Plus, Sparkles } from "lucide-react"
import { RestaurantSwiper } from "@/components/group-dinner/restaurant-swiper"
import { SelectionScreen } from "@/components/group-dinner/selection-screen"
import { ConfirmationModal } from "@/components/group-dinner/confirmation-modal"
import { ParticipantSelector } from "@/components/group-dinner/participant-selector"
import { CategorySelectionModal } from "@/components/group-dinner/category-selection-modal"
import { TutorialOverlay } from "@/components/tutorial/tutorial-overlay"
import { TutorialBanner } from "@/components/tutorial/tutorial-banner"
import { ErrorState } from "@/components/tutorial/error-state"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useGroupDinnerState } from "@/lib/hooks/use-group-dinner-state"
import { useModalState } from "@/lib/hooks/use-modal-state"
import { useTutorialKeyboardNav } from "@/lib/hooks/use-tutorial-keyboard-nav"
import type { User, GroupDinnerMatch, ListCategory } from "@/types"

export default function GroupDinnerTutorialPage() {
  const router = useRouter()

  // Custom hooks
  const {
    currentUser,
    selectedParticipants,
    matches,
    currentIndex,
    savedRestaurants,
    selectedMatch,
    selectedCategory,
    loading,
    error,
    loadMatches,
    handleSwipeRight,
    handleSwipeLeft,
    selectRestaurant,
    addParticipant,
    removeParticipant,
    setCategory,
    resetSwiper,
    retry,
    shouldShowSelectionScreen,
  } = useGroupDinnerState()

  const {
    modals,
    closeCategoryModal,
    openParticipantSelector,
    closeParticipantSelector,
    openSelectionScreen,
    closeSelectionScreen,
    openConfirmationModal,
    closeConfirmationModal,
  } = useModalState()

  // Load matches when category is selected or participants change
  React.useEffect(() => {
    if (currentUser && !modals.showCategoryModal) {
      const participantIds = selectedParticipants.map(p => p.id)
      loadMatches(currentUser.id, participantIds, selectedCategory)
    }
  }, [currentUser, selectedParticipants, selectedCategory, modals.showCategoryModal, loadMatches])

  // Show selection screen when 3 restaurants saved
  React.useEffect(() => {
    if (shouldShowSelectionScreen && !modals.showSelectionScreen) {
      openSelectionScreen()
    }
  }, [shouldShowSelectionScreen, modals.showSelectionScreen, openSelectionScreen])

  // Handle restaurant selection from selection screen
  const handleSelectRestaurant = React.useCallback((match: GroupDinnerMatch) => {
    selectRestaurant(match)
    closeSelectionScreen()
    openConfirmationModal()
  }, [selectRestaurant, closeSelectionScreen, openConfirmationModal])

  // Handle shuffle
  const handleShuffle = React.useCallback(async () => {
    if (!currentUser) return
    const participantIds = selectedParticipants.map((p) => p.id)
    await loadMatches(currentUser.id, participantIds, selectedCategory)
    resetSwiper()
    closeSelectionScreen()
  }, [currentUser, selectedParticipants, selectedCategory, loadMatches, resetSwiper, closeSelectionScreen])

  // Handle start over
  const handleStartOver = React.useCallback(() => {
    resetSwiper()
    closeSelectionScreen()
  }, [resetSwiper, closeSelectionScreen])

  // Handle participant confirmation
  const handleParticipantsConfirm = React.useCallback(async (participants: User[]) => {
    // Update participants
    participants.forEach(p => addParticipant(p))
    closeParticipantSelector()

    if (currentUser) {
      await loadMatches(currentUser.id, participants.map((p) => p.id), selectedCategory)
    }
  }, [currentUser, selectedCategory, addParticipant, closeParticipantSelector, loadMatches])

  // Handle keep swiping from confirmation
  const handleKeepSwiping = React.useCallback(() => {
    closeConfirmationModal()
    selectRestaurant(undefined as any) // Clear selection
  }, [closeConfirmationModal, selectRestaurant])

  // Handle category selection
  const handleSelectCategory = React.useCallback((category: ListCategory) => {
    setCategory(category)
    closeCategoryModal()
  }, [setCategory, closeCategoryModal])

  // Tutorial navigation
  const handleBack = React.useCallback(() => {
    router.push('/')
  }, [router])

  const handleNext = React.useCallback(() => {
    router.push('/tutorial/what-to-order')
  }, [router])

  const handleViewDetails = React.useCallback((id: string) => {
    router.push(`/restaurant/${id}`)
  }, [router])

  // Keyboard navigation
  useTutorialKeyboardNav({
    onNext: handleNext,
    onBack: handleBack,
    onEscape: React.useCallback(() => {
      if (modals.showConfirmationModal) {
        closeConfirmationModal()
      } else if (modals.showSelectionScreen) {
        closeSelectionScreen()
      } else if (modals.showParticipantSelector) {
        closeParticipantSelector()
      } else if (modals.showCategoryModal) {
        closeCategoryModal()
      }
    }, [modals, closeConfirmationModal, closeSelectionScreen, closeParticipantSelector, closeCategoryModal]),
  })

  // Loading state
  if (loading && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading tutorial...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorState
          message={error.message || "Failed to load tutorial. Please try again."}
          onRetry={retry}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="Group Dinner"
        description="Last minute plans and overwhelmed by choices? Let us do the thinking for you—swipe through curated matches and find the perfect spot fast"
      />

      {/* Mobile Header */}
      <div className="md:hidden bg-white px-4 py-3 border-b flex-shrink-0">
        <h1 className="text-2xl font-bold">Group Dinner</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white px-6 py-4 border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Group Dinner</h1>
          <p className="text-muted mt-1">
            Quick decision-making for when you need a spot but don't know where to go • Use{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              ←
            </kbd>{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              →
            </kbd>{" "}
            to swipe
          </p>
        </div>
      </div>

      {/* How It Works Section - Tutorial Only */}
      <div className="bg-primary/5 border-y border-primary/20 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Decision-Free Dining</h3>
              <p className="text-sm text-gray-700">
                Stop scrolling endlessly through options. We curate restaurants that fit your vibe and party size,
                so you can swipe through a handful of great choices and pick one fast. Swipe right to save, swipe left to pass. Perfect for when you're
                hungry, indecisive, or just need someone else to handle the planning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Section */}
      <div className="bg-white border-b p-4 flex-shrink-0">
        <button
          onClick={openParticipantSelector}
          className="w-full max-w-2xl mx-auto"
        >
          {selectedParticipants.length > 0 ? (
            /* Selected Participants Display */
            <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-3 hover:bg-primary/10 transition-colors">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-primary">
                  Dining with {selectedParticipants.length} {selectedParticipants.length === 1 ? "person" : "people"}
                </p>
                <p className="text-xs text-muted">
                  {selectedParticipants.map(p => p.displayName).join(", ")}
                </p>
              </div>
              <div className="flex -space-x-2">
                {selectedParticipants.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                ))}
                {selectedParticipants.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-800">
                      +{selectedParticipants.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State - Add Participants */
            <div className="flex items-center justify-center gap-2 py-3 text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors">
              <Plus className="h-5 w-5" />
              <span>Add people you're eating with</span>
            </div>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-32 md:pb-4">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Finding perfect matches...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorState
            message={error.message || "Failed to load matches"}
            onRetry={retry}
          />
        ) : modals.showSelectionScreen ? (
          <SelectionScreen
            savedRestaurants={savedRestaurants}
            onSelectRestaurant={handleSelectRestaurant}
            onStartOver={handleStartOver}
            onBack={closeSelectionScreen}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <RestaurantSwiper
            matches={matches}
            currentIndex={currentIndex}
            savedCount={savedRestaurants.length}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onShuffle={handleShuffle}
          />
        )}
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        currentStep={1}
        totalSteps={3}
        featureName="Group Dinner"
        onBack={handleBack}
        onNext={handleNext}
      />

      {/* Modals */}
      {currentUser && (
        <>
          <ParticipantSelector
            open={modals.showParticipantSelector}
            selected={selectedParticipants}
            currentUser={currentUser}
            onClose={closeParticipantSelector}
            onConfirm={handleParticipantsConfirm}
          />

          <ConfirmationModal
            open={modals.showConfirmationModal}
            match={selectedMatch}
            participants={selectedParticipants}
            onClose={closeConfirmationModal}
            onKeepSwiping={handleKeepSwiping}
          />

          <CategorySelectionModal
            open={modals.showCategoryModal}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onOpenChange={closeCategoryModal}
          />
        </>
      )}
    </div>
  )
}
