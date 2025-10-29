'use client'

import { useListProgress } from '@/lib/hooks'
import { FeaturedListCard } from './featured-list-card'
import { List } from '@/types'

interface FeaturedListCardWithProgressProps {
  list: List
  userId: string
}

export function FeaturedListCardWithProgress({
  list,
  userId,
}: FeaturedListCardWithProgressProps) {
  const { data: progress } = useListProgress(userId, list.id)

  return <FeaturedListCard list={list} progress={progress} />
}
