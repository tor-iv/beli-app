'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { SettingsRow } from '@/components/settings/settings-row';
import { useUserSettingsStore } from '@/lib/stores/user-settings-store';


export default function AppSettingsPage() {
  const vibrationsDisabled = useUserSettingsStore((state) => state.vibrationsDisabled);
  const setVibrationsDisabled = useUserSettingsStore((state) => state.setVibrationsDisabled);
  const distanceUnit = useUserSettingsStore((state) => state.distanceUnit);
  const setDistanceUnit = useUserSettingsStore((state) => state.setDistanceUnit);

  const handleDistanceUnitClick = () => {
    // Show action sheet or modal to select between Miles and Kilometers
    const newUnit = distanceUnit === 'Miles' ? 'Kilometers' : 'Miles';
    if (confirm(`Change distance unit to ${newUnit}?`)) {
      setDistanceUnit(newUnit);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">App settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <SettingsRow
            type="toggle"
            label="Disable vibrations"
            sublabel="Turn off haptic feedback"
            checked={vibrationsDisabled}
            onCheckedChange={setVibrationsDisabled}
          />

          <button onClick={handleDistanceUnitClick} className="w-full">
            <SettingsRow type="info" label="Distance units" value={distanceUnit} />
          </button>
        </div>
      </div>
    </div>
  );
}
