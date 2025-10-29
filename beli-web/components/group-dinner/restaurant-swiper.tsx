"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, PanInfo, useMotionValue, useTransform, useAnimation } from "framer-motion"
import { X, Shuffle, Heart, CheckCircle2 } from "lucide-react"
import { GroupDinnerCard } from "./group-dinner-card"
import { IconButton } from "@/components/ui/icon-button"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import type { GroupDinnerMatch } from "@/types"
import { cn } from "@/lib/utils"

interface RestaurantSwiperProps {
  matches: GroupDinnerMatch[]
  currentIndex: number
  savedCount: number
  onSwipeRight: (match: GroupDinnerMatch) => void
  onSwipeLeft: (match: GroupDinnerMatch) => void
  onShuffle: () => void
}

export function RestaurantSwiper({
  matches,
  currentIndex,
  savedCount,
  onSwipeRight,
  onSwipeLeft,
  onShuffle,
}: RestaurantSwiperProps) {
  const router = useRouter()
  const [isExiting, setIsExiting] = React.useState(false)
  const isMounted = React.useRef(false)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Track mount state
  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      controls.stop() // Cancel any ongoing animations
    }
  }, [controls])

  // Calculate threshold based on window width
  const getThreshold = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth * 0.25
    }
    return 100
  }

  // Interpolate rotation from drag distance
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10])

  // Interpolate pass label opacity (shows when dragging left)
  const passOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0])

  // Interpolate save label opacity (shows when dragging right)
  const saveOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1])

  const currentMatch = currentIndex < matches.length ? matches[currentIndex] : null
  const nextMatch = currentIndex + 1 < matches.length ? matches[currentIndex + 1] : null
  const hasMoreCards = currentIndex < matches.length

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (isExiting || !currentMatch) return

    const threshold = getThreshold()

    if (info.offset.x > threshold && savedCount < 3) {
      // Right swipe - SAVE
      animateExit(1)
      setTimeout(() => onSwipeRight(currentMatch), 250)
    } else if (info.offset.x < -threshold) {
      // Left swipe - PASS
      animateExit(-1)
      setTimeout(() => onSwipeLeft(currentMatch), 250)
    } else {
      // Reset to center (spring animation)
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } })
    }
  }

  const animateExit = (direction: 1 | -1) => {
    setIsExiting(true)
    const exitX = direction * (typeof window !== "undefined" ? window.innerWidth + 100 : 500)
    controls.start({
      x: exitX,
      transition: { duration: 0.25, ease: "easeOut" }
    }).then(() => {
      if (isMounted.current) {
        setIsExiting(false)
        x.set(0)
      }
    })
  }

  const handlePass = () => {
    if (isExiting || !currentMatch) return
    animateExit(-1)
    setTimeout(() => onSwipeLeft(currentMatch), 250)
  }

  const handleLock = () => {
    if (isExiting || !currentMatch || savedCount >= 3) return
    animateExit(1)
    setTimeout(() => onSwipeRight(currentMatch), 250)
  }

  const handleShuffle = () => {
    if (isExiting) return
    onShuffle()
  }

  // Keyboard controls for desktop
  React.useEffect(() => {
    if (!isDesktop) return // Only enable on desktop

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if animating or no card available
      if (isExiting || !currentMatch) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePass()
      } else if (e.key === "ArrowRight" && savedCount < 3) {
        e.preventDefault()
        handleLock()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDesktop, isExiting, currentMatch, savedCount])

  if (!hasMoreCards) {
    // Empty state
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-xl font-bold mb-2">No more restaurants!</h3>
        <p className="text-base text-muted mb-6 max-w-sm">
          You've swiped through all available matches. Click shuffle below to see restaurants again.
        </p>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          <Shuffle className="h-5 w-5" />
          <span>Shuffle</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Card Stack Container */}
      <div className="flex-1 relative px-4 pt-6 pb-24">
        {/* Next Card (Background) */}
        {nextMatch && (
          <div className="absolute inset-x-4 top-6 opacity-30 scale-95">
            <GroupDinnerCard
              match={nextMatch}
              savedCount={savedCount}
            />
          </div>
        )}

        {/* Current Card (Foreground) */}
        {currentMatch && (
          <motion.div
            className="relative"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            animate={controls}
          >
            {/* PASS Label (Left) */}
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-8 left-8 z-10 bg-red-500 text-white text-2xl font-bold px-6 py-3 rounded-xl shadow-lg rotate-[-15deg] pointer-events-none"
            >
              PASS
            </motion.div>

            {/* SAVE Label (Right) */}
            <motion.div
              style={{ opacity: saveOpacity }}
              className="absolute top-8 right-8 z-10 bg-green-500 text-white text-2xl font-bold px-6 py-3 rounded-xl shadow-lg rotate-[15deg] pointer-events-none"
            >
              SAVE
            </motion.div>

            <GroupDinnerCard
              match={currentMatch}
              savedCount={savedCount}
              onViewDetails={() => {
                // Navigate to restaurant details
                router.push(`/restaurant/${currentMatch.restaurant.id}`)
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Desktop Keyboard Instructions */}
      {isDesktop && (
        <div className="text-center pb-2 px-4">
          <p className="text-sm text-gray-700">
            Use{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              ←
            </kbd>{" "}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              →
            </kbd>{" "}
            arrow keys to swipe
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom">
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          {/* Pass Button */}
          <IconButton
            variant="ghost"
            size="large"
            onClick={handlePass}
            disabled={isExiting}
            className={cn(
              "border-2 border-gray-300",
              isExiting && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Pass"
          >
            <X className="h-7 w-7 text-gray-800" />
          </IconButton>

          {/* Shuffle Button */}
          <IconButton
            variant="default"
            size="large"
            onClick={handleShuffle}
            disabled={isExiting}
            className={cn(
              "border-2 border-primary",
              isExiting && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Shuffle"
          >
            <Shuffle className="h-6 w-6 text-primary" />
          </IconButton>

          {/* Save/Lock Button */}
          <IconButton
            variant="primary"
            size="large"
            onClick={handleLock}
            disabled={isExiting || savedCount >= 3}
            className={cn(
              savedCount >= 3 && "opacity-50 cursor-not-allowed"
            )}
            aria-label={savedCount >= 3 ? "Limit reached" : "Save"}
          >
            <Heart className="h-7 w-7 text-white fill-white" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
