import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Link href={`/profile/${user.username}`}>
      <Card className="beli-card cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{user.displayName}</h3>
              <p className="text-sm text-muted truncate">@{user.username}</p>

              <div className="flex items-center gap-4 mt-1 text-xs text-muted">
                <span>{user.stats.followers} followers</span>
                <span>•</span>
                <span>{user.stats.beenCount} been</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
