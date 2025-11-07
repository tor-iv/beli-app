'use client';

import { Trophy, Flame } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface ProfileStatCardProps {
  icon: 'trophy' | 'flame';
  label: string;
  value: string;
  iconColor?: string;
}

const iconMap = {
  trophy: Trophy,
  flame: Flame,
};

export const ProfileStatCard = ({
  icon,
  label,
  value,
  iconColor = '#0B7B7F',
}: ProfileStatCardProps) => {
  const IconComponent = iconMap[icon];

  return (
    <Card className="flex-1 border-gray-200">
      <CardContent className="flex items-center gap-3 p-4">
        <IconComponent className="h-8 w-8" style={{ color: iconColor }} />
        <div className="flex-1">
          <p className="text-sm text-gray-700">{label}</p>
          <p className="text-xl font-bold" style={{ color: iconColor }}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
