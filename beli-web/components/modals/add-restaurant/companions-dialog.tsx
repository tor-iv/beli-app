'use client';

import { X, CheckCircle2, Circle } from 'lucide-react';
import * as React from 'react';

import { SearchBar } from '@/components/navigation/search-bar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomSheet, BottomSheetContent, BottomSheetTitle } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { SocialService } from '@/lib/services';

import type { User } from '@/types';

interface CompanionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companions: User[];
  currentUser: User;
  onSave: (companions: User[]) => void;
}

interface UserItemProps {
  user: User;
  selected: boolean;
  onToggle: () => void;
}

const UserItem = ({ user, selected, onToggle }: UserItemProps) => {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-3 p-3 transition-colors hover:bg-gray-50"
    >
      <Avatar className="h-11 w-11">
        <AvatarImage src={user.avatar} alt={user.displayName} />
        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left">
        <p className="font-semibold leading-tight">{user.displayName}</p>
        <p className="text-sm leading-tight text-secondary">@{user.username}</p>
      </div>
      {selected ? (
        <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary" />
      ) : (
        <Circle className="h-6 w-6 flex-shrink-0 text-gray-300" />
      )}
    </button>
  );
};

export function CompanionsDialog({
  open,
  onOpenChange,
  companions,
  currentUser,
  onSave,
}: CompanionsDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [friends, setFriends] = React.useState<User[]>([]);
  const [recentCompanions, setRecentCompanions] = React.useState<User[]>([]);
  const [localSelected, setLocalSelected] = React.useState<User[]>(companions);
  const [loading, setLoading] = React.useState(false);

  // Load friends and recent companions when modal opens
  React.useEffect(() => {
    if (open) {
      loadData();
      setLocalSelected(companions);
      setSearchQuery('');
    }
  }, [open, companions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, recentData] = await Promise.all([
        SocialService.getUserFriends(currentUser.id),
        SocialService.getRecentDiningCompanions(currentUser.id),
      ]);

      // Filter out current user
      setFriends(friendsData.filter((u) => u.id !== currentUser.id));
      setRecentCompanions(recentData.filter((u) => u.id !== currentUser.id));
    } catch (error) {
      console.error('Failed to load companions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter search results
  const searchResults = React.useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return friends.filter(
      (u) =>
        u.displayName.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)
    );
  }, [searchQuery, friends]);

  const isSelected = (userId: string) => {
    return localSelected.some((u) => u.id === userId);
  };

  const handleToggle = (user: User) => {
    if (isSelected(user.id)) {
      setLocalSelected((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      setLocalSelected((prev) => [...prev, user]);
    }
  };

  const handleRemove = (userId: string) => {
    setLocalSelected((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSave = () => {
    onSave(localSelected);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="flex h-[80vh] flex-col p-0">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
          <BottomSheetTitle className="text-xl font-bold">Who did you go with?</BottomSheetTitle>
          <button
            onClick={handleClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Selected Chips Row */}
        {localSelected.length > 0 && (
          <div className="flex-shrink-0 overflow-x-auto border-b px-4 py-3">
            <div className="flex min-w-min gap-2">
              {localSelected.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primary/10 px-3 py-1.5"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.displayName}</span>
                  <button
                    onClick={() => handleRemove(user.id)}
                    className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                    aria-label={`Remove ${user.displayName}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex-shrink-0 px-4 py-3">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search friends..."
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-secondary">Loading...</p>
            </div>
          ) : searchQuery ? (
            /* Search Results */
            <div className="px-4">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    selected={isSelected(user.id)}
                    onToggle={() => handleToggle(user)}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-secondary">No results found</p>
              )}
            </div>
          ) : (
            /* Default: Recent + All Friends */
            <>
              {/* Recent Dining Companions */}
              {recentCompanions.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 px-4 text-xs font-semibold text-secondary">
                    RECENT DINING COMPANIONS
                  </h3>
                  {recentCompanions.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      selected={isSelected(user.id)}
                      onToggle={() => handleToggle(user)}
                    />
                  ))}
                </div>
              )}

              {/* All Friends */}
              <div>
                <h3 className="mb-2 px-4 text-xs font-semibold text-secondary">ALL FRIENDS</h3>
                {friends.length > 0 ? (
                  friends.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      selected={isSelected(user.id)}
                      onToggle={() => handleToggle(user)}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-secondary">No friends found</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t p-4">
          <Button onClick={handleSave} className="w-full">
            Done {localSelected.length > 0 && `(${localSelected.length} selected)`}
          </Button>
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
