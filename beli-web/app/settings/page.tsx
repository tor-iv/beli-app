import * as React from "react"
import {
  User,
  Bell,
  Shield,
  Smartphone,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { SettingsCard } from "@/components/settings/settings-card"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Your account */}
          <SettingsCard
            icon={User}
            title="Your account"
            subtitle="Change password, update contact info, etc."
            href="/settings/account"
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />

          {/* Notifications */}
          <SettingsCard
            icon={Bell}
            title="Notifications"
            subtitle="Select which notifications you receive from us"
            href="/settings/notifications"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />

          {/* Privacy */}
          <SettingsCard
            icon={Shield}
            title="Privacy"
            subtitle="Manage the information you see and share on Beli"
            href="/settings/privacy"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />

          {/* Your app */}
          <SettingsCard
            icon={Smartphone}
            title="Your app"
            subtitle="Disable vibrations, set distance units"
            href="/settings/app"
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />

          {/* Help */}
          <SettingsCard
            icon={HelpCircle}
            title="Help"
            subtitle="Read our frequently asked questions and contact support"
            href="/faq"
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-8" />

        {/* Logout */}
        <Link href="/logout">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-red-500">
                  Log out
                </h3>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
