import Link from 'next/link';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { MatchPercentageBadge } from '@/components/ui/match-percentage-badge';

import type { User } from '@/types';


interface UserCardProps {
  user: User;
  matchPercentage?: number;
  showMatchPercentage?: boolean;
}

export const UserCard = ({ user, matchPercentage, showMatchPercentage = true }: UserCardProps) => {
  return (
    <Link href={`/profile/${user.username}`}>
      <Card className="beli-card cursor-pointer transition-shadow hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <h3 className="truncate text-base font-semibold">{user.displayName}</h3>
                {showMatchPercentage && matchPercentage !== undefined && (
                  <MatchPercentageBadge percentage={matchPercentage} variant="compact" />
                )}
              </div>
              <p className="truncate text-sm text-muted">@{user.username}</p>

              <p className="mt-1 text-xs text-muted">
                {user.stats.followers} Followers • {user.stats.beenCount} Been
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
