import type { Restaurant, User } from "@/types"

/**
 * Share restaurant details with dining companions
 * Uses Web Share API if available, otherwise copies to clipboard
 */
export async function shareGroupDinner(
  restaurant: Restaurant,
  participants: User[]
): Promise<void> {
  const participantNames = participants.map((p) => p.displayName).join(", ")
  const text = `Let's meet at ${restaurant.name}!\n\n${
    participants.length > 0 ? `Dining with: ${participantNames}\n\n` : ""
  }Address: ${restaurant.location.address}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Dinner at ${restaurant.name}`,
        text: text,
      })
    } catch (err) {
      // User cancelled or share failed
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err)
      }
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Show toast notification "Link copied to clipboard"
    } catch (err) {
      console.error("Clipboard write failed:", err)
    }
  }
}
