import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RestaurantScoreCardProps {
  title: string;
  description: string;
  score: number;
  sampleSize?: number;
  variant?: 'rec' | 'friend' | 'average';
}

export function RestaurantScoreCard({
  title,
  description,
  score,
  sampleSize,
  variant = 'rec',
}: RestaurantScoreCardProps) {
  // Get color based on score (matching native color system)
  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue >= 8.5) return '#22C55E'; // Excellent (green)
    if (scoreValue >= 7.0) return '#84CC16'; // Good (light green)
    if (scoreValue >= 5.0) return '#F97316'; // Average (orange)
    return '#EF4444'; // Poor (red)
  };

  // Format sample size (2150 → "2k", 980 → "980", 15000 → "15k")
  const formatSampleSize = (size: number): string => {
    if (size >= 1000) {
      const thousands = Math.floor(size / 1000);
      const remainder = size % 1000;
      if (remainder === 0) {
        return `${thousands}k`;
      }
      return `${thousands}.${Math.floor(remainder / 100)}k`;
    }
    return size.toString();
  };

  const scoreColor = getScoreColor(score);

  return (
    <Card className="flex-shrink-0 w-[240px] beli-card">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-2 text-sm">{title}</h3>
        <p className="text-xs text-muted mb-4">{description}</p>

        {/* Score Circle with Sample Size Badge */}
        <div className="flex justify-center items-center mb-4">
          <div className="relative">
            {/* Circular Score Display */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
              style={{
                backgroundColor: `${scoreColor}15`,
                color: scoreColor,
              }}
            >
              {score.toFixed(1)}
            </div>

            {/* Sample Size Badge (Bottom-right overlay) */}
            {sampleSize && (
              <Badge
                variant="secondary"
                className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 h-5 hover:bg-gray-800"
              >
                {formatSampleSize(sampleSize)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
