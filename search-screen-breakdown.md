# Search Screen Breakdown

## Branding & Dismiss Controls
- **Beli wordmark** sits in the top-left with a teal "SC" badge to signify the Social Club brand extension.
- **Dismiss icon** (gray circular `×`) anchors the top-right, visually framed as a modal close affordance.

## Top Segmented Navigation
- Two-option selector with icons: **Restaurants** (active, teal text + underline) and **Members** (inactive, secondary text tone).
- A slim teal underline sits directly beneath the active label while a hairline divider spans the segment bar.

## Primary Search Inputs
- **Search field**: rounded rectangle with a left-aligned search glyph, swapping placeholder copy between `Search restaurant, cuisine, occasion` and `Search members` depending on the active segment.
- **Location field** (Restaurants only): location pin icon + "Current Location" label + clear (`×`) action button.
- Inputs sit on a white card stack with subtle borders instead of drop shadows.

## Quick Action Chips
- Brand-teal actions: `Reserve now`, `Recs`, `Trending`, plus an icon-only circle for quick member discovery.
- Pills have white icon + label, the trailing circle keeps the single white people glyph.

## Recent Activity List
- Section header **Recents** followed by individual rows.
- Each row: clock (or search when filtered) icon on the left, restaurant name in bold, neighborhood in secondary text, trailing `×` clear button.
- Rows use white background, subtle separators to maintain readable density with vertical padding.

## Secondary Recommendations (No Keyboard State)
- Section title **Places you may have been** with supporting caption `Based on your calendar (Ranked 56 of 64)`.
- Appears once the keyboard is dismissed (`search-no-keyboard.png`), following the Recents list.

## Bottom Navigation Bar
- Five slots: Feed, Your Lists, **Search**, Leaderboard, Profile.
- **Search tab** now mirrors the other tabs, swapping to a success-green icon and label when active.
- Other tabs rely on line icons with label text beneath.

## Keyboard State Differences
- With the keyboard open (`search.png`), the Recents list scrolls above the keyboard and the bottom navigation is obscured.
- Without the keyboard, the full list and bottom navigation are visible and maintain consistent safe-area padding.
