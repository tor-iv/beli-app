import { Badge } from '@/components/ui/badge';

interface RestaurantTagsListProps {
  tags: string[];
}

export const RestaurantTagsList = ({ tags }: RestaurantTagsListProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
      {/* Horizontal Scrolling Container */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 font-normal text-gray-700 hover:bg-gray-100"
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
