# What Should I Order Feature

## Overview

The "What Should I Order" feature is an intelligent menu ordering assistant that helps users quickly decide what to order at a restaurant based on party size and hunger level. The feature provides personalized suggestions with beautiful food imagery and allows users to shuffle through different combinations.

## Feature Access

Users can access this feature from the Restaurant Info page via a "What to Order" button in the Quick Actions section.

## User Flow

### Step 1: Setup
1. User taps "What to Order" button from restaurant page
2. Modal opens with two input options:
   - **Party Size**: Number picker (1-12 people) with increment/decrement buttons
   - **Hunger Level**: Three cards to choose from:
     - 🥗 Light Bites - Just a taste
     - 🍝 Moderately Hungry - Regular meal
     - 🍖 Very Hungry - Bring it all
3. User taps "Get Suggestions" button

### Step 2: Order Suggestions
1. Loading indicator shows "Creating your perfect order..."
2. System generates personalized order using smart algorithm
3. Results display with:
   - **Summary Card**:
     - Total price (large, prominent)
     - Price per person
     - Share button
     - Sharability description (e.g., "Perfect for 4 people")
     - Reasoning chips (e.g., "Includes crowd favorites", "Budget-friendly")
   - **Menu Items**: Scrollable list showing:
     - Large food photo (200px height)
     - Item name and description
     - Price and quantity badge
     - Portion size indicator
     - Dietary badges (vegetarian icon)
     - Category organization
4. **Floating Shuffle Button**: Teal circular button with shuffle icon
   - Positioned in bottom right
   - Animates on tap (rotation)
   - Regenerates new suggestion instantly
5. **Bottom CTA**: "Looks Good!" button to close modal

## Technical Architecture

### Data Model

#### MenuItem Type
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'entree' | 'side' | 'dessert' | 'drink';
  imageUrl: string;
  portionSize: 'small' | 'medium' | 'large' | 'shareable';
  tags: string[];
  popularity: number; // 0-100 score
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5;
}
```

#### OrderSuggestion Type
```typescript
interface OrderSuggestion {
  id: string;
  restaurantId: string;
  partySize: number;
  hungerLevel: 'light' | 'moderate' | 'very-hungry';
  items: Array<MenuItem & { quantity: number }>;
  totalPrice: number;
  reasoning: string[];
  estimatedSharability: string;
}
```

### Files Structure

```
src/
├── types.ts                          # Added MenuItem, OrderSuggestion types
├── data/
│   ├── mockDataService.ts           # Added menu methods
│   └── mock/
│       └── menuItems.ts             # NEW: Comprehensive menu data
├── components/
│   └── modals/
│       ├── WhatToOrderModal.tsx     # NEW: Main modal component
│       └── index.ts                 # Export added
└── screens/
    └── RestaurantInfoScreen.tsx     # Integrated modal
```

### MockDataService Methods

#### `getRestaurantMenu(restaurantId: string): Promise<MenuItem[]>`
- Returns all menu items for a restaurant
- Sorts by category (appetizer → entree → side → dessert → drink)
- Secondary sort by popularity score

#### `generateOrderSuggestion(restaurantId, partySize, hungerLevel, dietaryRestrictions?): Promise<OrderSuggestion>`
- Core algorithm that creates personalized order suggestions
- Takes into account:
  - Party size (1-12 people)
  - Hunger level (light/moderate/very-hungry)
  - Optional dietary restrictions
  - Item popularity scores
  - Portion sizes

## Suggestion Algorithm

### Hunger Points System

Base calculation:
```
totalHungerPoints = partySize × 10 × hungerMultiplier

hungerMultipliers:
- light: 0.8
- moderate: 1.2
- very-hungry: 1.8
```

### Portion Points
```
small: 5 points
medium: 10 points
large: 15 points
shareable: 12 points
```

### Selection Strategy

#### Solo Dining (1 person)
- **Light**: 1 appetizer OR 1 entree
- **Moderate**: 1 entree + optional appetizer
- **Very Hungry**: appetizer + entree + dessert

#### Group Dining (2+ people)
1. **Appetizers**: `ceil(partySize / 2)` appetizers (max 1-3 based on hunger)
2. **Entrees**:
   - Light: `ceil(partySize × 0.5)` entrees
   - Moderate: 1 entree per person
   - Very Hungry: `partySize + floor(partySize / 3)` entrees
3. **Sides**: 0-2 sides (moderate/very-hungry only)
4. **Desserts**: `ceil(partySize / 2)` desserts (very-hungry only)
5. **Drinks**: 2 drink types × partySize quantity (groups of 2+)

### Item Selection Logic
- Prioritizes by popularity score (top-rated first)
- Ensures variety across categories
- Avoids duplicate items (increases quantity instead)
- Respects dietary restrictions if provided
- Adds quantity badges for duplicates

### Reasoning Generation
Auto-generated reasons based on selection:
- "Shareable starters for the table" (appetizers selected)
- "Includes crowd favorites" (high popularity items)
- "Perfect for X people" (portion matching)
- "Budget-friendly option" (< $30 per person)
- "Premium dining experience" (> $60 per person)
- "Sweet ending to your meal" (dessert included)
- "Complementary sides to share" (sides included)

## Mock Data

### Menu Coverage
Currently includes menus for:
- **Moody Tongue Pizza**: 10 items (Japanese-fusion pizza)
- **Balthazar**: 12 items (French bistro)
- Additional restaurant menus can be added to `menuItems.ts`

### Menu Item Examples
Each restaurant has:
- 2-3 appetizers
- 3-5 entrees
- 0-2 sides
- 1-2 desserts
- 1-2 drinks

### Image Sources
All food images use Unsplash with query parameters:
- Format: `https://images.unsplash.com/photo-{id}?w=600&auto=format&fit=crop`
- Optimized for mobile display
- High quality, professional food photography

## UI/UX Details

### Animations
1. **Shuffle Animation**:
   - Fade out content (opacity 0.3, 150ms)
   - Rotate shuffle icon (360deg, 200ms)
   - Fade in new content (opacity 1, 150ms)

2. **Modal Transitions**:
   - Slide up animation (React Native default)
   - Page sheet presentation style
   - Smooth step transitions

### Color Scheme
- **Hunger Level Cards**:
  - Light: Green (#34C759)
  - Moderate: Orange (#FF9500)
  - Very Hungry: Red (#FF3B30)
- **Primary Actions**: Teal (#0B7B7F)
- **Success Indicators**: Green (#34C759)

### Responsive Design
- 2×2 grid for quick action buttons
- Wrapping enabled for smaller screens
- Minimum button width: 47%
- Consistent spacing: 12px gap

## Share Functionality

### Share Format
```
Order for [Restaurant Name]
Party of [X] • [Hunger Level]

[Quantity]× [Item Name] - $[Price]
[Quantity]× [Item Name] - $[Price]
...

Total: $[Total Price]

[Sharability Description]

Suggested by beli 🍽️
```

### Share Channels
Uses React Native's native Share API:
- iMessage
- WhatsApp
- Email
- Notes
- Copy to clipboard
- etc.

## Error Handling

### No Menu Available
If restaurant doesn't have a menu:
- "What to Order" button is disabled
- Shows as grayed out
- No error modal needed (preventive UI)

### API Errors
- Try-catch blocks in suggestion generation
- Console logging for debugging
- Graceful fallback (loading state removed)

## Performance Considerations

1. **Lazy Loading**: Menu images loaded on-demand
2. **Animation Performance**: Uses `useNativeDriver: true` where possible
3. **Delay Simulation**:
   - Menu fetch: 150ms (matches other API calls)
   - Suggestion generation: 300ms (feels like AI processing)
4. **State Management**: Local state only (no global store needed)

## Future Enhancements

### Short-term
1. **Dietary Filters**: Add UI for dietary restriction toggles
2. **Favorites Integration**: Highlight items on user's favorites list
3. **Price Range Filter**: Allow users to set budget constraints
4. **Save Orders**: Let users save suggestions for later

### Long-term
1. **ML-based Suggestions**: Learn from user preferences and past orders
2. **Real Menu APIs**: Integration with restaurant POS systems
3. **Nutritional Info**: Display calories, allergens, macros
4. **Group Voting**: Allow multiple users to vote on suggestions
5. **Order Placement**: Direct integration with delivery services
6. **Photos from Friends**: Show photos from friends who've ordered these items
7. **Seasonal Menus**: Auto-update based on restaurant's seasonal offerings

## Testing Checklist

### Functionality
- [ ] Party size increments/decrements correctly (1-12)
- [ ] All three hunger levels selectable
- [ ] Suggestions generate successfully
- [ ] Shuffle creates new suggestions
- [ ] Share functionality works
- [ ] Modal closes correctly
- [ ] Back button navigates to setup step

### Edge Cases
- [ ] Solo dining (1 person) suggestions appropriate
- [ ] Large group (12 people) suggestions reasonable
- [ ] Restaurant with no menu (button disabled)
- [ ] Very hungry level generates substantial order
- [ ] Light level generates small order
- [ ] Prices calculate correctly with quantities

### UI/UX
- [ ] Animations smooth and performant
- [ ] Images load properly
- [ ] Layout responsive on different screen sizes
- [ ] Touch targets adequate size
- [ ] Loading states clear
- [ ] Text readable and well-formatted

### Data Quality
- [ ] All menu items have valid images
- [ ] Prices realistic for restaurant's price range
- [ ] Descriptions accurate and appealing
- [ ] Portion sizes match item types
- [ ] No duplicate suggestions in 5 shuffles

## Known Limitations

1. **Static Menu Data**: Menus are hardcoded, not dynamic
2. **Limited Restaurant Coverage**: Only 2 restaurants have full menus
3. **No Real-time Availability**: Can't check if items are currently available
4. **No Customization**: Can't modify items (e.g., "no onions")
5. **No Allergen Data**: Limited dietary information
6. **No Price Updates**: Prices are static in mock data

## Metrics to Track (Future)

1. **Engagement**:
   - % of restaurant views that open "What to Order"
   - Average time spent in modal
   - Shuffle frequency per session

2. **Quality**:
   - Share rate
   - Items actually ordered vs suggested
   - User feedback ratings

3. **Business**:
   - Conversion rate (suggestion → actual order)
   - Average order value from suggestions
   - Repeat usage rate

## Conclusion

The "What Should I Order" feature provides a delightful, intelligent way to help users make dining decisions. The smart algorithm considers multiple factors to create balanced, appropriate suggestions while the beautiful UI makes the experience enjoyable. With proper menu data and future ML integration, this could become a core value proposition for the beli app.
