'use client';

import { Send, MessageCircle } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

import type { Activity, ActivityComment, User } from '@/types';

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  currentUser?: User;
  onAddComment?: (content: string) => void;
}

function formatTimeAgo(date: Date | string): string {
  const timestamp = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  return `${Math.floor(diffInDays / 7)}w`;
}

export const CommentsModal = ({
  open,
  onOpenChange,
  activity,
  currentUser,
  onAddComment,
}: CommentsModalProps) => {
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<ActivityComment[]>(
    activity.interactions?.comments || []
  );

  const handleSubmit = () => {
    if (!commentText.trim() || !currentUser) return;

    // Create new comment
    const newComment: ActivityComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      content: commentText.trim(),
      timestamp: new Date(),
    };

    // Add to local state (optimistic UI)
    setLocalComments([...localComments, newComment]);

    // Call parent handler if provided
    onAddComment?.(commentText.trim());

    // Clear input
    setCommentText('');
  };

  // Mock user data for displaying comments (in real app, would fetch from service)
  const getUserForComment = (userId: string): User => {
    if (currentUser && userId === currentUser.id) {
      return currentUser;
    }
    // Return activity user as fallback
    return activity.user;
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="flex max-h-[85vh] flex-col">
        <BottomSheetHeader className="border-b border-gray-100">
          <BottomSheetTitle>Comments</BottomSheetTitle>
        </BottomSheetHeader>

        {/* Comments List */}
        <ScrollArea className="-mx-6 flex-1 px-6">
          {localComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="mb-6 h-16 w-16 text-gray-800" />
              <p className="mb-1.5 text-base font-semibold text-gray-700">No comments yet</p>
              <p className="text-sm text-gray-700">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-5 pb-4">
              {localComments.map((comment) => {
                const commentUser = getUserForComment(comment.userId);
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={commentUser.avatar} alt={commentUser.displayName} />
                      <AvatarFallback>{commentUser.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {commentUser.displayName}
                        </span>
                        <span className="text-xs text-gray-700">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        {currentUser && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="max-h-[120px] min-h-[60px] resize-none rounded-[20px] border-gray-200 bg-gray-50 transition-colors focus:border-[#0B7B7F] focus:bg-white focus:ring-[#0B7B7F]/20"
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!commentText.trim()}
                  size="icon"
                  className="h-10 w-10 rounded-full bg-[#0B7B7F] shadow-sm transition-all hover:bg-[#0B7B7F]/90 disabled:bg-gray-200 disabled:text-gray-800"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
}
