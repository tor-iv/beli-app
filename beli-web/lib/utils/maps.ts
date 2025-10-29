import type { Restaurant } from "@/types"

/**
 * Open restaurant location in Google Maps (new tab)
 */
export function openInMaps(restaurant: Restaurant): void {
  const { lat, lng } = restaurant.location.coordinates
  const name = encodeURIComponent(restaurant.name)

  // Use Google Maps with coordinates and place name
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${name}`

  window.open(url, "_blank", "noopener,noreferrer")
}

/**
 * Get Google Maps directions URL
 */
export function getDirectionsUrl(restaurant: Restaurant): string {
  const { lat, lng } = restaurant.location.coordinates
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

/**
 * Get Apple Maps URL (for iOS/macOS)
 */
export function getAppleMapsUrl(restaurant: Restaurant): string {
  const { lat, lng } = restaurant.location.coordinates
  return `https://maps.apple.com/?daddr=${lat},${lng}`
}
