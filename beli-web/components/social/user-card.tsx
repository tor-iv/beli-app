import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MatchPercentageBadge } from '@/components/ui/match-percentage-badge';
import Link from 'next/link';

interface UserCardProps {
  user: User;
  matchPercentage?: number;
  showMatchPercentage?: boolean;
}

export function UserCard({ user, matchPercentage, showMatchPercentage = true }: UserCardProps) {
  return (
    <Link href={`/profile/${user.username}`}>
      <Card className="beli-card cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-base truncate">{user.displayName}</h3>
                {showMatchPercentage && matchPercentage !== undefined && (
                  <MatchPercentageBadge percentage={matchPercentage} variant="compact" />
                )}
              </div>
              <p className="text-sm text-muted truncate">@{user.username}</p>

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
