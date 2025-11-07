'use client';

import { Utensils } from 'lucide-react';
import { useState } from 'react';

import { WhatToOrderModal } from '@/components/modals/what-to-order-modal';
import { Button } from '@/components/ui/button';

import type { Restaurant } from '@/types';

interface WhatToOrderButtonProps {
  restaurant: Restaurant;
}

export const WhatToOrderButton = ({ restaurant }: WhatToOrderButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  // Don't show button if restaurant has no menu
  if (!restaurant.menu || restaurant.menu.length === 0) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
        <Utensils className="mr-2 h-4 w-4" />
        What to Order
      </Button>
      <WhatToOrderModal open={showModal} onOpenChange={setShowModal} restaurant={restaurant} />
    </>
  );
}
