'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { SettingsRow } from '@/components/settings/settings-row';
import { useUserSettingsStore } from '@/lib/stores/user-settings-store';


export default function PrivacySettingsPage() {
  const isPublicAccount = useUserSettingsStore((state) => state.isPublicAccount);
  const setIsPublicAccount = useUserSettingsStore((state) => state.setIsPublicAccount);
  const blockedUsers = useUserSettingsStore((state) => state.blockedUsers);
  const mutedUsers = useUserSettingsStore((state) => state.mutedUsers);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Privacy settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <SettingsRow
            type="toggle"
            label="Public Account"
            sublabel={
              isPublicAccount
                ? 'Anyone can see your profile'
                : 'Only approved followers can see your content'
            }
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

          <SettingsRow type="navigation" label="Manage cookies" href="/settings/privacy/cookies" />
        </div>
      </div>
    </div>
  );
}
