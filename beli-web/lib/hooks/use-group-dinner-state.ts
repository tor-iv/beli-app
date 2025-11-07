'use client'

import { useState, useCallback, useEffect } from 'react'
import { MockDataService } from '@/lib/mockDataService'
import type { User, GroupDinnerMatch, ListCategory } from '@/types'

const MAX_SAVED_RESTAURANTS = 3

export function useGroupDinnerState() {
  const [currentUser, setCurrentUser] = useState<User>()
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([])
  const [matches, setMatches] = useState<GroupDinnerMatch[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [savedRestaurants, setSavedRestaurants] = useState<GroupDinnerMatch[]>([])
  const [selectedMatch, setSelectedMatch] = useState<GroupDinnerMatch>()
  const [selectedCategory, setSelectedCategory] = useState<ListCategory>('restaurants')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize - load current user
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)
        const user = await MockDataService.getCurrentUser()
        setCurrentUser(user)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize'))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Load matches based on participants and category
  const loadMatches = useCallback(async (
    userId: string,
    participantIds: string[],
    category?: ListCategory
  ) => {
    setLoading(true)
    setError(null)
    try {
      const suggestions = await MockDataService.getGroupDinnerSuggestions(
        userId,
        participantIds.length > 0 ? participantIds : undefined,
        category
      )
      setMatches(suggestions)
      setCurrentIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load matches'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle swipe right (save restaurant)
  const handleSwipeRight = useCallback((match: GroupDinnerMatch) => {
    if (savedRestaurants.length < MAX_SAVED_RESTAURANTS) {
      setSavedRestaurants(prev => [...prev, match])
    }
    setCurrentIndex(prev => prev + 1)
  }, [savedRestaurants.length])

  // Handle swipe left (pass on restaurant)
  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex(prev => prev + 1)
  }, [])

  // Select a restaurant from saved list
  const selectRestaurant = useCallback((match: GroupDinnerMatch) => {
    setSelectedMatch(match)
  }, [])

  // Add participant
  const addParticipant = useCallback((user: User) => {
    setSelectedParticipants(prev => {
      if (prev.some(p => p.id === user.id)) {
        return prev
      }
      return [...prev, user]
    })
  }, [])

  // Remove participant
  const removeParticipant = useCallback((userId: string) => {
    setSelectedParticipants(prev => prev.filter(p => p.id !== userId))
  }, [])

  // Set category
  const setCategory = useCallback((category: ListCategory) => {
    setSelectedCategory(category)
    // Reset saved restaurants when changing category
    setSavedRestaurants([])
    setCurrentIndex(0)
  }, [])

  // Reset swiper to beginning
  const resetSwiper = useCallback(() => {
    setCurrentIndex(0)
    setSavedRestaurants([])
  }, [])

  // Retry loading on error
  const retry = useCallback(() => {
    if (currentUser) {
      const participantIds = selectedParticipants.map(p => p.id)
      loadMatches(currentUser.id, participantIds, selectedCategory)
    }
  }, [currentUser, selectedParticipants, selectedCategory, loadMatches])

  return {
    // State
    currentUser,
    selectedParticipants,
    matches,
    currentIndex,
    savedRestaurants,
    selectedMatch,
    selectedCategory,
    loading,
    error,

    // Actions
    loadMatches,
    handleSwipeRight,
    handleSwipeLeft,
    selectRestaurant,
    addParticipant,
    removeParticipant,
    setCategory,
    resetSwiper,
    retry,

    // Derived state
    hasReachedEnd: currentIndex >= matches.length,
    canSaveMore: savedRestaurants.length < MAX_SAVED_RESTAURANTS,
    shouldShowSelectionScreen: savedRestaurants.length === MAX_SAVED_RESTAURANTS,
  }
}
