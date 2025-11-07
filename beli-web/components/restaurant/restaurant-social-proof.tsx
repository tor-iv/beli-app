import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import type { Restaurant } from '@/types';

interface RestaurantSocialProofProps {
  restaurant: Restaurant;
}

export const RestaurantSocialProof = ({ restaurant }: RestaurantSocialProofProps) => {
  const { friendsWantToTryCount = 0, friendAvatars = [] } = restaurant;

  // Don't render if no friends want to try
  if (friendsWantToTryCount === 0) {
    return null;
  }

  // Show up to 4 avatars
  const displayAvatars = friendAvatars.slice(0, 4);
  const friendText =
    friendsWantToTryCount === 1
      ? '1 friend wants to try this'
      : `${friendsWantToTryCount} friends want to try this`;

  return (
    <div className="flex items-center gap-3 py-4">
      {/* Overlapping Avatar Stack */}
      {displayAvatars.length > 0 && (
        <div className="flex -space-x-2">
          {displayAvatars.map((avatarUrl, index) => (
            <Avatar key={index} className="h-8 w-8 border-2 border-background ring-2 ring-white">
              <AvatarImage src={avatarUrl} alt={`Friend ${index + 1}`} />
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                F{index + 1}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}

      {/* Friend Count Text */}
      <p className="text-sm">
        <span className="font-semibold text-primary">{friendText}</span>
      </p>
    </div>
  );
}
