"use client";

import { Restaurant, User } from '@/types';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { Link2, Instagram, MessageCircle, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
  user?: User;
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  gradient?: string;
  backgroundColor?: string;
  action: () => void;
}

export function ShareModal({
  open,
  onOpenChange,
  restaurant,
  user,
}: ShareModalProps) {
  const { toast } = useToast();

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/restaurant/${restaurant.id}`;
  const shareText = user
    ? `Check out ${restaurant.name} on beli - recommended by ${user.displayName}!`
    : `Check out ${restaurant.name} on beli!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Restaurant link copied to clipboard",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: shareText,
          url: shareUrl,
        });
        onOpenChange(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleIGStory = () => {
    toast({
      title: "Share to Instagram Story",
      description: "This would open Instagram to share as a story",
    });
    onOpenChange(false);
  };

  const handleIGPost = () => {
    toast({
      title: "Share to Instagram Post",
      description: "This would open Instagram to create a post",
    });
    onOpenChange(false);
  };

  const handleMessages = () => {
    handleNativeShare();
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'copy',
      label: 'Copy Link',
      icon: <Link2 className="h-8 w-8" />,
      backgroundColor: '#48484A',
      action: handleCopyLink,
    },
    {
      id: 'ig-story',
      label: 'IG Story',
      icon: <Instagram className="h-8 w-8" />,
      gradient: 'linear-gradient(45deg, #833AB4, #FD1D1D, #FCAF45)',
      action: handleIGStory,
    },
    {
      id: 'ig-post',
      label: 'IG Post',
      icon: <Instagram className="h-8 w-8" />,
      gradient: 'linear-gradient(45deg, #F77737, #E1306C)',
      action: handleIGPost,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageCircle className="h-8 w-8" />,
      backgroundColor: '#00D856',
      action: handleMessages,
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 className="h-8 w-8" />,
      backgroundColor: '#007AFF',
      action: handleNativeShare,
    },
  ];

  const restaurantRating = restaurant.scores?.averageScore || restaurant.rating || 0;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="bg-[#0B7B7F] max-h-[85vh]">
        {/* Restaurant Card Preview */}
        <div className="px-6 mb-6 flex justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full">
            {user && (
              <div className="flex items-center mb-4 pb-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-base font-semibold text-gray-900">
                    {user.displayName}
                  </p>
                  <p className="text-sm text-gray-800">
                    @{user.username}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#0B7B7F]">
                  beli
                </p>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-gray-800 mb-1">
                  {restaurant.cuisine.join(', ')} • {restaurant.location.city}, {restaurant.location.state}
                </p>
                {user && (
                  <p className="text-sm text-gray-700">
                    1 visit
                  </p>
                )}
              </div>
              {restaurantRating > 0 && (
                <RatingBubble rating={restaurantRating} size="md" />
              )}
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-t-3xl pt-4 pb-8 px-6">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

          <BottomSheetHeader className="pb-6">
            <BottomSheetTitle className="text-center text-2xl">
              Share this page
            </BottomSheetTitle>
          </BottomSheetHeader>

          {/* Share Options */}
          <div className="flex justify-center gap-4 overflow-x-auto pb-2">
            {shareOptions.map((option) => (
              <div
                key={option.id}
                className="flex flex-col items-center min-w-[85px]"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full w-20 h-20 p-0 hover:opacity-90 transition-opacity"
                  style={{
                    background: option.gradient || option.backgroundColor,
                  }}
                  onClick={option.action}
                >
                  <div className="text-white">
                    {option.icon}
                  </div>
                </Button>
                <p className="text-sm text-gray-800 mt-2 text-center">
                  {option.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
