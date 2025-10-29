'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { IoEllipsisHorizontal, IoFlame, IoHeart, IoPeople, IoRestaurant } from 'react-icons/io5';
import { useRouter } from 'next/navigation';

export function MoreMenu() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    router.push(`/lists?view=${view}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <IoEllipsisHorizontal className="h-4 w-4" />
          <span>More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleViewChange('reserve')} className="gap-2">
          <IoRestaurant className="h-4 w-4" />
          <span>Reserve Now</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange('nearby')} className="gap-2">
          <IoHeart className="h-4 w-4" />
          <span>Recommendations Nearby</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleViewChange('trending')} className="gap-2">
          <IoFlame className="h-4 w-4" />
          <span>Trending</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleViewChange('friends')} className="gap-2">
          <IoPeople className="h-4 w-4" />
          <span>Recommendations from Friends</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
