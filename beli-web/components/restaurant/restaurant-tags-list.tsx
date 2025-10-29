import { Badge } from '@/components/ui/badge';

interface RestaurantTagsListProps {
  tags: string[];
}

export function RestaurantTagsList({ tags }: RestaurantTagsListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
      {/* Horizontal Scrolling Container */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-100 text-gray-700 font-normal rounded-full"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
