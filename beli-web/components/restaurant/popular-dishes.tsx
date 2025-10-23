import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PopularDishesProps {
  dishes?: string[];
}

export function PopularDishes({ dishes }: PopularDishesProps) {
  if (!dishes || dishes.length === 0) return null;

  return (
    <Card className="beli-card">
      <CardHeader>
        <CardTitle>Popular Dishes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {dishes.map((dish, index) => (
            <Badge key={index} variant="secondary">
              {dish}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
