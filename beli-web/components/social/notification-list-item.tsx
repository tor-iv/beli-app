'use client';

import { Notification } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export function NotificationListItem({ notification, onPress }: NotificationListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    onPress(notification);
  };

  // Format timestamp
  const getTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'today';
    return `${diffInDays}d`;
  };

  // Render notification text with inline formatting
  const renderNotificationText = () => {
    const { type, actorUser, targetRestaurant, commentText, streakCount, actionDescription } = notification;

    if (type === 'streak') {
      return (
        <p className="text-[15px] leading-5 text-black">
          <span className="font-bold">{streakCount} Week Streak!</span>{' '}
          <span className="font-normal">{actionDescription}</span>
        </p>
      );
    }

    if (type === 'comment') {
      return (
        <p className="text-[15px] leading-5 text-black">
          <span className="font-semibold">{actorUser?.displayName}</span>{' '}
          <span className="font-normal">{actionDescription}</span>{' '}
          <span className="font-bold">{targetRestaurant?.name}</span>
          {commentText && (
            <>
              <span className="font-normal">: </span>
              <span className="font-normal">{commentText}</span>
            </>
          )}
        </p>
      );
    }

    if (type === 'list_bookmark') {
      return (
        <p className="text-[15px] leading-5 text-black">
          <span className="font-semibold">{actorUser?.displayName}</span>{' '}
          <span className="font-normal">{actionDescription}</span>{' '}
          <span className="font-bold">{targetRestaurant?.name}</span>{' '}
          <span className="font-normal">from your list</span>
        </p>
      );
    }

    // rating_liked, bookmark_liked, follow, recommendation
    return (
      <p className="text-[15px] leading-5 text-black">
        <span className="font-semibold">{actorUser?.displayName}</span>{' '}
        <span className="font-normal">{actionDescription}</span>{' '}
        {targetRestaurant && <span className="font-bold">{targetRestaurant.name}</span>}
      </p>
    );
  };

  return (
    <button
      onClick={handleClick}
      className="w-full min-h-[80px] px-4 py-4 bg-white hover:bg-[#FAFAFA] active:bg-[#FAFAFA] flex items-start gap-3 text-left transition-colors"
    >
      {/* Avatar or Streak Icon */}
      <div className="flex-shrink-0 w-12 h-12">
        {notification.type === 'streak' ? (
          <div className="w-12 h-12 rounded-full bg-[#FAFAFA] flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#8E8E93]" />
          </div>
        ) : (
          <Avatar className="w-12 h-12">
            <AvatarImage src={notification.actorUser?.avatar} alt={notification.actorUser?.displayName} />
            <AvatarFallback>{notification.actorUser?.displayName?.[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {renderNotificationText()}
        <p className="text-[13px] text-[#8E8E93] mt-1">
          {getTimestamp(notification.timestamp)}
        </p>
      </div>
    </button>
  );
}
