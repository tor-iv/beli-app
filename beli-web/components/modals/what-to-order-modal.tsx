'use client';

import { Minus, Plus, Shuffle, Share2, Check, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MenuService } from '@/lib/services';

import type { Restaurant, OrderSuggestion, HungerLevel, MealTime } from '@/types';

interface WhatToOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
}

type Step = 'setup' | 'suggestions';

// Helper function to auto-detect meal time based on current hour
const getMealTimeFromHour = (): MealTime => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return 'any-time';
};

const HUNGER_LEVELS: Array<{
  value: HungerLevel;
  icon: string;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'light',
    icon: '🥗',
    label: 'Light Bites',
    description: 'Just a taste',
    color: '#34C759',
  },
  {
    value: 'moderate',
    icon: '🍝',
    label: 'Moderately Hungry',
    description: 'Regular meal',
    color: '#FF9500',
  },
  {
    value: 'very-hungry',
    icon: '🍖',
    label: 'Very Hungry',
    description: 'Bring it all',
    color: '#FF3B30',
  },
];

export const WhatToOrderModal = ({ open, onOpenChange, restaurant }: WhatToOrderModalProps) => {
  const [step, setStep] = useState<Step>('setup');
  const [partySize, setPartySize] = useState(2);
  const [hungerLevel, setHungerLevel] = useState<HungerLevel>('moderate');
  const [suggestion, setSuggestion] = useState<OrderSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep('setup');
    setPartySize(2);
    setHungerLevel('moderate');
    setSuggestion(null);
    onOpenChange(false);
  };

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const detectedMealTime = getMealTimeFromHour();
      const result = await MenuService.generateOrderSuggestion(
        restaurant.id,
        partySize,
        hungerLevel,
        detectedMealTime
      );
      setSuggestion(result);
      setStep('suggestions');
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = async () => {
    try {
      const detectedMealTime = getMealTimeFromHour();
      const result = await MenuService.generateOrderSuggestion(
        restaurant.id,
        partySize,
        hungerLevel,
        detectedMealTime
      );
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to shuffle suggestions:', error);
    }
  };

  const handleShare = async () => {
    if (!suggestion) return;

    const itemsList = suggestion.items
      .map((item) => `${item.quantity}× ${item.name} - $${item.price * item.quantity}`)
      .join('\n');

    const message = `Order for ${restaurant.name}\nParty of ${suggestion.partySize} • ${suggestion.hungerLevel.replace('-', ' ')}\n\n${itemsList}\n\nTotal: $${suggestion.totalPrice.toFixed(2)}\n\n${suggestion.estimatedSharability}\n\nSuggested by beli 🍽️`;

    if (navigator.share) {
      await navigator.share({ text: message });
    } else {
      await navigator.clipboard.writeText(message);
      alert('Order copied to clipboard!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === 'setup' ? 'What Should We Order?' : 'Your Order'}</DialogTitle>
        </DialogHeader>

        {step === 'setup' ? (
          <div className="space-y-6">
            {/* Party Size */}
            <div>
              <h3 className="mb-4 font-semibold">How many people?</h3>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPartySize(Math.max(1, partySize - 1))}
                  disabled={partySize === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="min-w-[100px] text-center">
                  <div className="text-5xl font-bold">{partySize}</div>
                  <div className="text-sm text-muted-foreground">
                    {partySize === 1 ? 'person' : 'people'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPartySize(Math.min(12, partySize + 1))}
                  disabled={partySize === 12}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hunger Level */}
            <div>
              <h3 className="mb-4 font-semibold">How hungry are you?</h3>
              <div className="space-y-3">
                {HUNGER_LEVELS.map((level) => (
                  <Card
                    key={level.value}
                    className={`cursor-pointer transition-all ${
                      hungerLevel === level.value ? 'border-2 shadow-md' : 'hover:shadow-sm'
                    }`}
                    style={{
                      borderColor: hungerLevel === level.value ? level.color : undefined,
                      backgroundColor: hungerLevel === level.value ? `${level.color}10` : undefined,
                    }}
                    onClick={() => setHungerLevel(level.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{level.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateSuggestions}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Get Suggestions'
              )}
            </Button>
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="text-4xl font-bold text-primary">
                      ${suggestion.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${(suggestion.totalPrice / suggestion.partySize).toFixed(2)} per person
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mb-3">{suggestion.estimatedSharability}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.reasoning.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      <Check className="mr-1 h-3 w-3" />
                      {reason}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="space-y-3">
              {suggestion.items.map((item, index) => (
                <Card key={`${item.id}-${index}`}>
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-32 w-32 rounded-l-lg object-cover"
                      />
                      <div className="flex-1 py-3 pr-3">
                        <div className="mb-1 flex items-start justify-between">
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.quantity > 1 && <Badge variant="default">×{item.quantity}</Badge>}
                        </div>
                        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {item.portionSize === 'shareable'
                                ? '🍽️ Shareable'
                                : item.portionSize.charAt(0).toUpperCase() +
                                  item.portionSize.slice(1)}
                            </Badge>
                            {item.isVegetarian && (
                              <Badge variant="outline" className="text-xs">
                                🌱
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShuffle} className="flex-1">
                <Shuffle className="mr-2 h-4 w-4" />
                Shuffle
              </Button>
              <Button onClick={handleClose} className="flex-1 bg-primary hover:bg-primary/90">
                Looks Good!
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
