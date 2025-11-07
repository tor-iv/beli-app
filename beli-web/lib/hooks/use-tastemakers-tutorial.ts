'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTastemakerPosts } from './use-tastemaker-posts'
import { useFeaturedLists } from './index'
import { useCurrentUser } from './use-user'
import { useTutorialKeyboardNav } from './use-tutorial-keyboard-nav'

export function useTastemakersTutorial() {
  const router = useRouter()
  const [mode, setMode] = useState<'lists' | 'articles'>('articles')
  const [category, setCategory] = useState('All')

  const { data: user } = useCurrentUser()
  const { data: featuredLists } = useFeaturedLists()
  const { data: allPostsData } = useTastemakerPosts()

  const featuredPosts = useMemo(
    () => allPostsData?.filter(p => p.isFeatured).slice(0, 3) || [],
    [allPostsData]
  )

  const allPosts = useMemo(
    () => allPostsData?.slice(0, 6) || [],
    [allPostsData]
  )

  const filteredPosts = useMemo(
    () => category === 'All' ? allPosts : allPosts.filter(p => p.tags.includes(category)),
    [allPosts, category]
  )

  const heroPost = featuredPosts[0]
  const otherFeaturedPosts = featuredPosts.slice(1)

  const handleBack = useCallback(() => {
    router.push('/tutorial/what-to-order')
  }, [router])

  const handleNext = useCallback(() => {
    router.push('/feed')
  }, [router])

  // Keyboard navigation
  useTutorialKeyboardNav({
    onNext: handleNext,
    onBack: handleBack,
  })

  return {
    // State
    mode,
    category,
    user,
    featuredLists,

    // Computed data
    featuredPosts,
    allPosts,
    filteredPosts,
    heroPost,
    otherFeaturedPosts,

    // Actions
    setMode,
    setCategory,
    handleBack,
    handleNext,
  }
}
