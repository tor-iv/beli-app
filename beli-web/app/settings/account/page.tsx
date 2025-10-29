"use client"

import * as React from "react"
import {
  Mail,
  Phone,
  Lock,
  CreditCard,
  GraduationCap,
  Briefcase,
  Shield,
  PauseCircle,
  Trash2,
  ChevronLeft,
} from "lucide-react"
import { SettingsRow } from "@/components/settings/settings-row"
import { useUserSettingsStore } from "@/lib/stores/user-settings-store"
import Link from "next/link"

export default function AccountSettingsPage() {
  const email = useUserSettingsStore((state) => state.email)
  const phoneNumber = useUserSettingsStore((state) => state.phoneNumber)
  const school = useUserSettingsStore((state) => state.school)
  const company = useUserSettingsStore((state) => state.company)

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate your account? You can come back whenever you want.")) {
      // TODO: Implement deactivation
      console.log("Account deactivated")
    }
  }

  const handleDelete = () => {
    if (confirm("This action is permanent and cannot be undone. All your data will be deleted. Are you sure you want to delete your account?")) {
      // TODO: Implement deletion
      console.log("Account deleted")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary hover:text-foreground transition-colors" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Manage account</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <SettingsRow
            type="navigation"
            icon={Mail}
            label="Change email"
            sublabel={email}
            href="/settings/account/email"
          />

          <SettingsRow
            type="navigation"
            icon={Phone}
            label="Change phone number"
            sublabel={phoneNumber}
            href="/settings/account/phone"
          />

          <SettingsRow
            type="navigation"
            icon={Lock}
            label="Change password"
            href="/settings/password"
          />

          <SettingsRow
            type="navigation"
            icon={CreditCard}
            label="Manage payment methods"
            href="/settings/account/payment"
          />

          <SettingsRow
            type="navigation"
            icon={GraduationCap}
            label="Add school"
            sublabel={school || undefined}
            href="/settings/account/school"
          />

          <SettingsRow
            type="navigation"
            icon={Briefcase}
            label="Company settings"
            sublabel={company || undefined}
            href="/settings/account/company"
          />

          <SettingsRow
            type="navigation"
            icon={Shield}
            label="Privacy settings"
            href="/settings/privacy"
          />
        </div>

        {/* Destructive actions */}
        <div className="bg-white border-b border-gray-200 shadow-sm mt-8">
          <button
            onClick={handleDeactivate}
            className="w-full"
          >
            <SettingsRow
              type="info"
              icon={PauseCircle}
              label="Deactivate my account"
              sublabel="Come back whenever you want"
              value=""
              destructive
            />
          </button>

          <button
            onClick={handleDelete}
            className="w-full"
          >
            <SettingsRow
              type="info"
              icon={Trash2}
              label="Delete my account"
              sublabel="Permanently delete your account"
              value=""
              destructive
            />
          </button>
        </div>
      </div>
    </div>
  )
}
