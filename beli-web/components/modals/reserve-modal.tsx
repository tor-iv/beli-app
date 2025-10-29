'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Info } from 'lucide-react';
import { Restaurant } from '@/types';

interface ReserveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
}

export function ReserveModal({ open, onOpenChange, restaurant }: ReserveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reserve at {restaurant.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Coming Soon Message */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Reservations Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  We're working on integrating restaurant reservations. In the meantime, you can:
                </p>
              </div>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="space-y-3">
            {restaurant.phone && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  window.location.href = `tel:${restaurant.phone}`;
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Call to make a reservation
              </Button>
            )}

            {restaurant.website && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  window.open(restaurant.website, '_blank', 'noopener,noreferrer');
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Visit website for reservations
              </Button>
            )}
          </div>

          {/* Preview of Future Features */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Coming soon, you'll be able to:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Select date and time
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                Choose party size
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                View real-time availability
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
