'use client';

import {
  Share2,
  Calendar,
  CalendarPlus,
  Navigation,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomSheet, BottomSheetContent, BottomSheetTitle } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { GroupDinnerMatch, User } from '@/types';

interface ConfirmationModalProps {
  open: boolean;
  match?: GroupDinnerMatch;
  participants: User[];
  onClose: () => void;
  onKeepSwiping: () => void;
}

interface ActionButtonProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const ActionButton = ({ icon: Icon, title, subtitle, onClick }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[15px] font-semibold leading-tight">{title}</p>
        <p className="text-[13px] leading-tight text-muted">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted" />
    </button>
  );
}

export const ConfirmationModal = ({
  open,
  match,
  participants,
  onClose,
  onKeepSwiping,
}: ConfirmationModalProps) => {
  const router = useRouter();

  if (!match) return null;

  const { restaurant, availability } = match;

  const handleShare = async () => {
    const participantNames = participants.map((p) => p.displayName).join(', ');
    const text = `Let's meet at ${restaurant.name}!\n\n${
      participants.length > 0 ? `Dining with: ${participantNames}\n\n` : ''
    }Address: ${restaurant.location.address}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dinner at ${restaurant.name}`,
          text,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(text);
      // TODO: Show toast "Link copied to clipboard"
      alert('Link copied to clipboard!');
    }
  };

  const handleReservation = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank');
    } else {
      alert('No website available for this restaurant');
    }
  };

  const handleCalendar = () => {
    // TODO: Implement calendar export utility
    alert('Calendar export coming soon!');
  };

  const handleDirections = () => {
    const { lat, lng } = restaurant.location.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleViewDetails = () => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  return (
    <BottomSheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <BottomSheetContent height="auto" className="p-0">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <BottomSheetTitle className="text-xl font-bold">Dinner Confirmed!</BottomSheetTitle>
        </div>

        {/* Restaurant Image with Success Badge */}
        <div className="relative h-[240px]">
          <Image src={restaurant.images[0]} alt={restaurant.name} fill className="object-cover" />
          {/* Success Badge Overlay */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-white shadow-lg">
              <span className="text-lg">✓</span>
              <span className="font-semibold">Perfect match!</span>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          {/* Name */}
          <h3 className="mb-1 text-2xl font-bold text-foreground">{restaurant.name}</h3>

          {/* Meta */}
          <p className="mb-2 text-base text-gray-900">
            {restaurant.cuisine.join(', ')} • {restaurant.priceRange}
          </p>

          {/* Address */}
          <p className="text-sm text-muted">{restaurant.location.address}</p>

          {/* Availability Card */}
          {availability && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
              <Clock className="h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm font-medium text-primary">
                Available {availability.timeSlot}
              </span>
            </div>
          )}

          {/* Dining With Section */}
          {participants.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold text-muted">DINING WITH</h4>
              <div className="flex flex-wrap gap-2">
                {participants.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-semibold text-muted">NEXT STEPS</h4>

            <div className="space-y-2">
              <ActionButton
                icon={Share2}
                title="Share with group"
                subtitle="Send location to dining companions"
                onClick={handleShare}
              />

              <ActionButton
                icon={Calendar}
                title="Make Reservation"
                subtitle="Book your table"
                onClick={handleReservation}
              />

              <ActionButton
                icon={CalendarPlus}
                title="Add to Calendar"
                subtitle="Save dinner to your calendar"
                onClick={handleCalendar}
              />

              <ActionButton
                icon={Navigation}
                title="Get Directions"
                subtitle="Open in maps"
                onClick={handleDirections}
              />

              <ActionButton
                icon={Info}
                title="View Details"
                subtitle="See full restaurant info"
                onClick={handleViewDetails}
              />
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="mt-6 flex gap-2">
            <Button variant="ghost" onClick={onKeepSwiping} className="flex-1">
              Keep Swiping
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
