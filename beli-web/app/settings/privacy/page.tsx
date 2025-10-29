"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { SettingsRow } from "@/components/settings/settings-row"
import { useUserSettingsStore } from "@/lib/stores/user-settings-store"
import Link from "next/link"

export default function PrivacySettingsPage() {
  const isPublicAccount = useUserSettingsStore((state) => state.isPublicAccount)
  const setIsPublicAccount = useUserSettingsStore((state) => state.setIsPublicAccount)
  const blockedUsers = useUserSettingsStore((state) => state.blockedUsers)
  const mutedUsers = useUserSettingsStore((state) => state.mutedUsers)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary hover:text-foreground transition-colors" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Privacy settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <SettingsRow
            type="toggle"
            label="Public Account"
            sublabel={isPublicAccount
              ? "Anyone can see your profile"
              : "Only approved followers can see your content"}
            checked={isPublicAccount}
            onCheckedChange={setIsPublicAccount}
          />

          <SettingsRow
            type="navigation"
            label="Blocked accounts"
            href="/settings/privacy/blocked"
            badge={blockedUsers.length}
          />

          <SettingsRow
            type="navigation"
            label="Muted accounts"
            href="/settings/privacy/muted"
            badge={mutedUsers.length}
          />

          <SettingsRow
            type="navigation"
            label="Manage cookies"
            href="/settings/privacy/cookies"
          />
        </div>
      </div>
    </div>
  )
}
