import { User, Bell, Shield, Smartphone, HelpCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { SettingsCard } from '@/components/settings/settings-card';


export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
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
        <div className="my-8 h-px bg-gray-200" />

        {/* Logout */}
        <Link href="/logout">
          <div className="cursor-pointer rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-semibold text-red-500">Log out</h3>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
