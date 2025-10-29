"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Plus, Sparkles } from "lucide-react"
import { MockDataService } from "@/lib/mockDataService"
import { RestaurantSwiper } from "@/components/group-dinner/restaurant-swiper"
import { SelectionScreen } from "@/components/group-dinner/selection-screen"
import { ConfirmationModal } from "@/components/group-dinner/confirmation-modal"
import { ParticipantSelector } from "@/components/group-dinner/participant-selector"
import { CategorySelectionModal } from "@/components/group-dinner/category-selection-modal"
import { TutorialOverlay } from "@/components/tutorial/tutorial-overlay"
import { TutorialBanner } from "@/components/tutorial/tutorial-banner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { User, GroupDinnerMatch, ListCategory } from "@/types"

export default function GroupDinnerTutorialPage() {
  const router = useRouter()

  // State
  const [currentUser, setCurrentUser] = React.useState<User>()
  const [selectedParticipants, setSelectedParticipants] = React.useState<User[]>([])
  const [matches, setMatches] = React.useState<GroupDinnerMatch[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [savedRestaurants, setSavedRestaurants] = React.useState<GroupDinnerMatch[]>([])
  const [showSelectionScreen, setShowSelectionScreen] = React.useState(false)
  const [selectedMatch, setSelectedMatch] = React.useState<GroupDinnerMatch>()
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false)
  const [showParticipantSelector, setShowParticipantSelector] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<ListCategory>('restaurants')
  const [showCategoryModal, setShowCategoryModal] = React.useState(true)
  const [loading, setLoading] = React.useState(true)

  // Load initial data
  React.useEffect(() => {
    const init = async () => {
      try {
        const user = await MockDataService.getCurrentUser()
        setCurrentUser(user)
        // Don't load matches yet - wait for category selection
      } catch (error) {
        console.error("Failed to initialize:", error)
      }
    }
    init()
  }, [])

  // Load matches when category is selected or participants change
  React.useEffect(() => {
    if (currentUser && !showCategoryModal) {
      const participantIds = selectedParticipants.map(p => p.id)
      loadMatches(currentUser.id, participantIds, selectedCategory)
    }
  }, [currentUser, selectedParticipants, selectedCategory, showCategoryModal])

  // Load suggestions based on participants
  const loadMatches = async (userId: string, participantIds: string[], category?: ListCategory) => {
    setLoading(true)
    try {
      const suggestions = await MockDataService.getGroupDinnerSuggestions(
        userId,
        participantIds.length > 0 ? participantIds : undefined,
        category
      )
      setMatches(suggestions)
      setCurrentIndex(0)
    } catch (error) {
      console.error("Failed to load matches:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle swipe right (save)
  const handleSwipeRight = (match: GroupDinnerMatch) => {
    if (savedRestaurants.length < 3) {
      const newSaved = [...savedRestaurants, match]
      setSavedRestaurants(newSaved)

      if (newSaved.length === 3) {
        setShowSelectionScreen(true)
      }
    }
    setCurrentIndex((prev) => prev + 1)
  }

  // Handle swipe left (pass)
  const handleSwipeLeft = (match: GroupDinnerMatch) => {
    setCurrentIndex((prev) => prev + 1)
  }

  // Handle restaurant selection from selection screen
  const handleSelectRestaurant = (match: GroupDinnerMatch) => {
    setSelectedMatch(match)
    setShowSelectionScreen(false)
    setShowConfirmationModal(true)
  }

  // Handle shuffle
  const handleShuffle = async () => {
    if (!currentUser) return
    const participantIds = selectedParticipants.map((p) => p.id)
    await loadMatches(currentUser.id, participantIds, selectedCategory)
    setSavedRestaurants([])
    setShowSelectionScreen(false)
  }

  // Handle start over
  const handleStartOver = () => {
    setSavedRestaurants([])
    setShowSelectionScreen(false)
    setCurrentIndex(0)
  }

  // Handle participant confirmation
  const handleParticipantsConfirm = async (participants: User[]) => {
    setSelectedParticipants(participants)
    setShowParticipantSelector(false)
    if (currentUser) {
      await loadMatches(currentUser.id, participants.map((p) => p.id), selectedCategory)
    }
  }

  // Handle keep swiping from confirmation
  const handleKeepSwiping = () => {
    setShowConfirmationModal(false)
    setSelectedMatch(undefined)
    // User can continue swiping with remaining cards
  }

  // Handle category selection
  const handleSelectCategory = (category: ListCategory) => {
    setSelectedCategory(category)
    setShowCategoryModal(false)
    // Reset saved restaurants when changing category
    setSavedRestaurants([])
  }

  // Tutorial navigation
  const handleBack = () => {
    router.push('/')
  }

  const handleNext = () => {
    router.push('/tutorial/what-to-order')
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
          onClick={() => setShowParticipantSelector(true)}
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
        ) : showSelectionScreen ? (
          <SelectionScreen
            savedRestaurants={savedRestaurants}
            onSelectRestaurant={handleSelectRestaurant}
            onStartOver={handleStartOver}
            onBack={() => setShowSelectionScreen(false)}
            onViewDetails={(id) => router.push(`/restaurant/${id}`)}
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
      <ParticipantSelector
        open={showParticipantSelector}
        selected={selectedParticipants}
        currentUser={currentUser}
        onClose={() => setShowParticipantSelector(false)}
        onConfirm={handleParticipantsConfirm}
      />

      <ConfirmationModal
        open={showConfirmationModal}
        match={selectedMatch}
        participants={selectedParticipants}
        onClose={() => setShowConfirmationModal(false)}
        onKeepSwiping={handleKeepSwiping}
      />

      <CategorySelectionModal
        open={showCategoryModal}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenChange={setShowCategoryModal}
      />
    </div>
  )
}
