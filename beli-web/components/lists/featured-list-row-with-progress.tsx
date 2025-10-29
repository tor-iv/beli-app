'use client'

import { useListProgress } from '@/lib/hooks'
import { FeaturedListRow } from './featured-list-row'
import { List } from '@/types'

interface FeaturedListRowWithProgressProps {
  list: List
  userId: string
  isLast?: boolean
}

export function FeaturedListRowWithProgress({
  list,
  userId,
  isLast = false,
}: FeaturedListRowWithProgressProps) {
  const { data: progress } = useListProgress(userId, list.id)

  const progressText = progress
    ? `You've been to ${progress.visited} of ${progress.total}`
    : `0 of ${list.restaurants.length} restaurants`

  return (
    <FeaturedListRow
      id={list.id}
      title={list.name}
      description={list.description || ''}
      thumbnailImage={list.thumbnailImage || '/placeholder-food.jpg'}
      progressText={progressText}
      isLast={isLast}
    />
  )
}
