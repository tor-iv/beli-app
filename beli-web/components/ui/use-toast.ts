import * as React from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    // For now, use console.log as a simple implementation
    // In production, this would trigger an actual toast notification
    console.log(`[Toast ${variant}]`, title, description)

    // Could also use alert for testing
    if (typeof window !== "undefined") {
      const message = description ? `${title}\n${description}` : title
      if (variant === "destructive") {
        console.error(message)
      } else {
        console.log(message)
      }
    }
  }

  return { toast }
}
