import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PopularDishesProps {
  dishes?: string[];
}

export const PopularDishes = ({ dishes }: PopularDishesProps) => {
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
