# Beli App Design System & Visual Style Guide

## Overall Design Philosophy
The Beli app embodies a **clean, premium, content-first** design approach that balances sophistication with approachability. It's not minimalist to the point of being sterile, but rather uses strategic visual elements to create hierarchy and delight.

## Visual Style Characteristics

### 1. **Design Aesthetic: Modern Premium Casual**
- **Not overly formal** - Friendly and accessible despite premium restaurant content
- **High information density** done elegantly - Lots of data without feeling cluttered
- **Editorial quality** - Feels like a curated magazine meets social app
- **Trust-building design** - Professional enough to trust for restaurant recommendations

### 2. **Color Palette**

#### Primary Colors
```css
--primary-teal: #0B7B7F        /* Main brand color - seen in headers/badges */
--primary-teal-dark: #005F46   /* Darker variant for CTAs */
--white: #FFFFFF               /* Primary background */
--off-white: #FAFAFA          /* Secondary background */
```

#### Semantic Colors
```css
--rating-excellent: #00A676    /* 8.0+ ratings - Green */
--rating-good: #52C41A         /* 7.0-7.9 ratings - Light green */
--rating-average: #FAAD14      /* 5.0-6.9 ratings - Orange */
--rating-poor: #FF4D4F         /* Below 5.0 - Red */
```

#### Text Colors
```css
--text-primary: #000000        /* Main text - pure black */
--text-secondary: #8E8E93      /* Secondary info - iOS system gray */
--text-tertiary: #C7C7CC       /* Disabled/placeholder */
```

#### UI Colors
```css
--border-light: #E5E5EA        /* Subtle borders */
--border-medium: #C7C7CC       /* Stronger borders */
--shadow: rgba(0,0,0,0.08)     /* Card shadows */
--overlay: rgba(0,0,0,0.5)     /* Modal backgrounds */
```

### 3. **Typography System**

#### Font Family
- **Primary:** SF Pro Display (iOS) / System UI
- **Characteristics:** Clean, highly legible, trustworthy

#### Font Sizes & Hierarchy
```css
--text-xs: 11px;     /* Metadata, small labels */
--text-sm: 13px;     /* Secondary information */
--text-base: 15px;   /* Body text, standard UI */
--text-lg: 17px;     /* Section headers, emphasis */
--text-xl: 20px;     /* Screen titles */
--text-2xl: 24px;    /* Major headers */
--text-3xl: 34px;    /* Hero numbers (rankings) */
```

#### Font Weights
```css
--font-regular: 400;  /* Body text */
--font-medium: 500;   /* Subtle emphasis */
--font-semibold: 600; /* Headers, buttons */
--font-bold: 700;     /* Strong emphasis */
```

### 4. **Component Styling**

#### Cards & Containers
- **Border Radius:** 12px (larger cards), 8px (small elements)
- **Shadows:** Subtle, single-direction (0 2px 8px rgba(0,0,0,0.08))
- **Padding:** 16px standard, 12px compact
- **Background:** Pure white with subtle shadows rather than borders

#### Buttons
- **Primary CTA:** Teal background, white text, 24px radius (pill-shaped)
- **Secondary:** White background, teal text, 1px teal border
- **Height:** 44px (Apple HIG standard)
- **Active state:** Slight scale down (0.98) with opacity (0.9)

#### Navigation Elements
- **Bottom Tab Bar:**
  - Height: 83px (including safe area)
  - Background: Pure white
  - No top border, uses shadow instead
  - Active icon: Teal fill
  - Inactive icon: Gray outline
  - Icon size: 24x24px

#### Rating Bubbles
- **Size:** 44x44px for large, 32x32px for inline
- **Shape:** Perfect circle
- **Color coding:** Green (8+), Yellow (6-7.9), Orange (4-5.9), Red (<4)
- **Font:** Bold, white text
- **Position:** Often overlaid on images or right-aligned in lists

### 5. **Layout Principles**

#### Spacing System
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-2xl: 32px;
```

#### Grid & Alignment
- **Edge padding:** 16px from screen edges
- **List items:** Full width with internal padding
- **Card spacing:** 12px between cards in feed
- **Section spacing:** 24px between major sections

### 6. **Visual Patterns**

#### Information Hierarchy
1. **Image first** - Large, high-quality food/restaurant photos
2. **Name prominence** - Restaurant names in bold, larger text
3. **Metadata styling** - Price range ($$$), cuisine, distance in gray
4. **Social proof** - Ratings, friend activity, visit counts prominently displayed

#### List Styles
- **Numbered lists:** Large numbers (1, 2, 3) in light gray
- **Avatar lists:** Circular images with rank numbers overlaid
- **Dividers:** None - uses spacing instead
- **Hover states:** Subtle background color change

#### Status Indicators
- **Online/Active:** Green dot
- **Streak badges:** Flame emoji with number
- **Verification:** Blue checkmark ("SC" badge)
- **Match percentage:** "+X% Match" in green

### 7. **Imagery Treatment**

#### Photos
- **Aspect ratios:**
  - Hero images: 16:9
  - Thumbnails: 1:1 (square)
  - Avatar: 1:1 (circular mask)
- **Loading:** Skeleton screens with animated shimmer
- **Quality:** High resolution, professionally shot appearance

#### Icons
- **Style:** SF Symbols / Line icons, not filled
- **Weight:** Regular (not bold)
- **Size:** 20x20px standard, 24x24px for navigation
- **Color:** Inherit from text color or teal for active

### 8. **Motion & Interaction Design**

#### Transitions
- **Duration:** 200-300ms for most transitions
- **Easing:** ease-in-out (cubic-bezier(0.4, 0, 0.2, 1))
- **Navigation:** Slide from right for push, fade for tabs

#### Feedback
- **Taps:** Immediate opacity change (0.7) or scale (0.98)
- **Success:** Subtle bounce animation
- **Loading:** Circular progress indicators in teal

#### Gestures
- **Pull to refresh:** Elastic bounce with teal spinner
- **Swipe actions:** Smooth 60fps horizontal swipe
- **Long press:** Haptic feedback + context menu

### 9. **Unique Design Elements**

#### The "Beli Signature" Elements
1. **Score bubbles** - Distinctive circular rating badges
2. **Match percentages** - Social compatibility scores
3. **Streak counters** - Gamification elements
4. **"SC" badge** - Supper Club membership indicator
5. **Multi-tier lists** - Been/Want to Try/Recs organization

#### Content Presentation
- **No unnecessary borders** - Clean separation using spacing
- **High data density** - Multiple data points per card without clutter
- **Progressive disclosure** - Core info visible, details on tap
- **Smart truncation** - "..." for long text with full view on tap

### 10. **Platform Adaptations**

#### iOS Specific
- Follows iOS Human Interface Guidelines
- Safe area considerations for notch/home indicator
- Native iOS controls (switches, segmented controls)
- San Francisco font family

#### Responsive Behavior
- **Phone portrait:** Primary experience (375px width minimum)
- **Phone landscape:** Not optimized (portrait lock recommended)
- **Tablet:** Scaled phone experience (not unique iPad layout)

## Design Principles Summary

### Do's ✅
- **White space is functional** - Use it to create hierarchy
- **Data density with breathing room** - Pack info smartly
- **Consistent teal accent** - Brand recognition
- **High-quality imagery** - Food photos are crucial
- **Clear CTAs** - Make actions obvious

### Don'ts ❌
- **No gradients** - Flat colors only
- **No dark mode** - Light theme only
- **No decorative elements** - Every pixel has purpose
- **No aggressive animations** - Subtle and functional only
- **No custom fonts** - System fonts for performance

## Implementation Notes

### CSS-in-JS Example
```jsx
const styles = StyleSheet.create({
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3, // Android shadow
  },
  ratingBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  }
});
```

## Key Takeaway
Beli's design succeeds because it **respects the content** (food/restaurants) while providing **just enough personality** through the teal accent color and playful elements like streaks and badges. It feels **trustworthy and sophisticated** without being intimidating, making users feel like they're part of an exclusive but welcoming food community.