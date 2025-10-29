'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  useListFilters,
  CITIES,
  CUISINES,
  TAGS,
  GOOD_FOR,
  SCORE_THRESHOLDS,
  FRIEND_THRESHOLDS,
} from '@/lib/stores/list-filters';
import { IoSearch } from 'react-icons/io5';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterModal({ open, onOpenChange }: FilterModalProps) {
  const filters = useListFilters();
  const [citySearch, setCitySearch] = useState('');
  const [cuisineSearch, setCuisineSearch] = useState('');

  const filteredCities = CITIES.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredCuisines = CUISINES.filter((cuisine) =>
    cuisine.toLowerCase().includes(cuisineSearch.toLowerCase())
  );

  const handleApply = () => {
    onOpenChange(false);
  };

  const handleReset = () => {
    filters.resetFilters();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl p-0">
        <DialogHeader className="border-b p-6 pb-4">
          <DialogTitle className="text-2xl">Filters</DialogTitle>
          <DialogDescription>
            Refine your restaurant list with advanced filters
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <Accordion type="multiple" className="w-full" defaultValue={['cities', 'cuisines']}>
            {/* City Filter */}
            <AccordionItem value="cities">
              <AccordionTrigger className="text-lg font-semibold">
                Cities
                {filters.cities.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.cities.length} selected)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="relative">
                    <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search cities..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-2 pr-4">
                      {filteredCities.map((city) => (
                        <div key={city} className="flex items-center space-x-2">
                          <Checkbox
                            id={`city-${city}`}
                            checked={filters.cities.includes(city)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                filters.addCity(city);
                              } else {
                                filters.removeCity(city);
                              }
                            }}
                          />
                          <label
                            htmlFor={`city-${city}`}
                            className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {city}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Cuisine Filter */}
            <AccordionItem value="cuisines">
              <AccordionTrigger className="text-lg font-semibold">
                Cuisines
                {filters.cuisines.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.cuisines.length} selected)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="relative">
                    <IoSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search cuisines..."
                      value={cuisineSearch}
                      onChange={(e) => setCuisineSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-48">
                    <div className="space-y-2 pr-4">
                      {filteredCuisines.map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cuisine-${cuisine}`}
                            checked={filters.cuisines.includes(cuisine)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                filters.addCuisine(cuisine);
                              } else {
                                filters.removeCuisine(cuisine);
                              }
                            }}
                          />
                          <label
                            htmlFor={`cuisine-${cuisine}`}
                            className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cuisine}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Price Filter */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-lg font-semibold">
                Price
                {filters.prices.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.prices.join(', ')})
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex gap-2">
                  {(['$', '$$', '$$$', '$$$$'] as const).map((price) => (
                    <Button
                      key={price}
                      variant={filters.prices.includes(price) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => filters.togglePrice(price)}
                      className="flex-1"
                    >
                      {price}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tags Filter */}
            <AccordionItem value="tags">
              <AccordionTrigger className="text-lg font-semibold">
                Tags
                {filters.tags.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.tags.length} selected)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  {TAGS.map((tag) => (
                    <Button
                      key={tag}
                      variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => filters.toggleTag(tag)}
                      className="justify-start text-left"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Good For Filter */}
            <AccordionItem value="goodFor">
              <AccordionTrigger className="text-lg font-semibold">
                Good For
                {filters.goodFor.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.goodFor.length} selected)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2">
                  {GOOD_FOR.map((option) => (
                    <Button
                      key={option}
                      variant={filters.goodFor.includes(option) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => filters.toggleGoodFor(option)}
                      className="justify-start text-left"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Score Filter */}
            <AccordionItem value="score">
              <AccordionTrigger className="text-lg font-semibold">
                Minimum Score
                {filters.minScore !== null && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.minScore}+)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex gap-2">
                  {SCORE_THRESHOLDS.map((threshold) => (
                    <Button
                      key={threshold.value}
                      variant={filters.minScore === threshold.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        filters.setMinScore(
                          filters.minScore === threshold.value ? null : threshold.value
                        )
                      }
                      className="flex-1"
                    >
                      {threshold.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Friend Filter */}
            <AccordionItem value="friends">
              <AccordionTrigger className="text-lg font-semibold">
                Minimum Friends
                {filters.minFriends !== null && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filters.minFriends}+)
                  </span>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex gap-2">
                  {FRIEND_THRESHOLDS.map((threshold) => (
                    <Button
                      key={threshold.value}
                      variant={filters.minFriends === threshold.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        filters.setMinFriends(
                          filters.minFriends === threshold.value ? null : threshold.value
                        )
                      }
                      className="flex-1"
                    >
                      {threshold.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Toggle Filters */}
            <AccordionItem value="other">
              <AccordionTrigger className="text-lg font-semibold">Other</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="open-now" className="flex-1 cursor-pointer">
                      <div className="font-medium">Open Now</div>
                      <div className="text-sm text-muted-foreground">
                        Show only restaurants currently open
                      </div>
                    </Label>
                    <Switch
                      id="open-now"
                      checked={filters.openNow}
                      onCheckedChange={filters.setOpenNow}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reservations" className="flex-1 cursor-pointer">
                      <div className="font-medium">Accepts Reservations</div>
                      <div className="text-sm text-muted-foreground">
                        Show only restaurants that accept reservations
                      </div>
                    </Label>
                    <Switch
                      id="reservations"
                      checked={filters.acceptsReservations}
                      onCheckedChange={filters.setAcceptsReservations}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>

        <DialogFooter className="border-t p-6 pt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset All
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
