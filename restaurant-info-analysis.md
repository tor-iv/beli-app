# Restaurant Info Screen Analysis

## Overall Layout
- The screen has a tall, scrollable layout with significant vertical spacing.
- The status bar at the top shows the time (11:45), location indicator, cellular signal, Wi‑Fi strength, and battery level (37%).
- Below the status bar, the primary content begins immediately with a full-width interactive map that occupies roughly the top third of the screen.
- A persistent bottom tab bar anchors the screen with five navigation icons and labels.

## Map Header Section
- A detailed street map (Manhattan/Gramercy area) displays with light pastel colors and street labels, showing streets like "E 18th St" and park areas in green.
- Left edge: a back chevron icon (<) with translucent circular background for navigation.
- Right edge: three circular icon buttons—notification bell, share/export arrow, and overflow/menu (three dots) arranged horizontally with translucent backgrounds.
- A floating circular "plus" button appears near the right edge of the map with a teal background and white plus icon.
- A bookmark icon (filled flag shape) appears to the right of the plus button, suggesting save/bookmark functionality.
- The map includes a gray point-of-interest pin marking the restaurant's location.
- The entire map section appears to be interactive and scrollable, serving as both a visual header and functional location reference.

## Restaurant Title Block
- Positioned just below the back button (still overlaying the map), the restaurant name "Moody Tongue Pizza" is rendered in a large serif typeface with bold weight, likely around 28-32pt size.
- A green pill-shaped badge on the left shows the overall rating "8.0" in white text with rounded corners and subtle drop shadow.
- Next to the badge, text reads "(1,849 ratings)" in a medium gray, smaller font size (approximately 14-16pt), indicating substantial user engagement.
- The title block has a subtle white/translucent background overlay to ensure readability against the map background.

## Tag Row & Metadata
- Directly below the title block is a horizontal list of tags separated by center dots: "Date Night · Gluten Free · Atmosphere · Sharing · Beer ·". The text is teal (#0B7B7F) to emphasize interactivity or filter-style tags, suggesting these are tappable filters or descriptive attributes.
- Following the tags, an info row states the price tier and cuisines: "$$ | Pizza, Japanese" in medium gray text, providing essential dining context.
- Secondary text presents the neighborhood and city: "Ukrainian Village, New York, NY" in a lighter gray (#666666 or similar), smaller font size for hierarchy.
- A small group of overlapping circular profile photos (4 visible avatars) with white borders indicates "4 friends want to try" the restaurant. The avatars appear to be actual user profile photos, adding social proof and personal connection.
- All metadata is left-aligned and follows a clear visual hierarchy with decreasing emphasis from tags to location to social proof.

## Action Buttons Row
- Three capsule buttons stretch horizontally with equal widths, each with icon + label: "Website" (globe icon), "Call" (phone icon), "Directions" (arrow/navigation icon).
- Buttons have teal (#0B7B7F) outlines, white backgrounds, rounded corners (approximately 8px radius), and comfortable horizontal spacing between them.
- Icons are positioned to the left of text labels within each button, using outline/stroke style icons consistent with the app's iconography.
- The entire row provides primary actions for immediate restaurant engagement, positioned prominently after core restaurant information.

## Scores Section
- Section title "Scores" appears on the left in bold text with an "SC" badge (small teal pill with white "SC" text), creating visual brand consistency.
- Right-aligned link "See all scores" in teal color, providing navigation to detailed scoring breakdown.
- Three circular score widgets sit on a single row with equal spacing:
  - **Rec Score** (left): Large circular badge with "8.0" inside in large white text, teal (#0B7B7F) border/background, small blue indicator bead showing "2k" sample size, and descriptive subtext "How much we think you will like it" in small gray text.
  - **Friend Score** (center): Score "8.5" with similar styling, small indicator bead labeled "2" (representing 2 friends' ratings), subtext "What your friends think".
  - **Average Score** (right): Score "8.3" with indicator bead showing "4k" (4,000+ ratings), subtext "What all Beli members think".
- Each score circle has subtle drop shadows and the indicator beads use different colors (blue, teal variations) to differentiate data sources.
- The scoring system clearly differentiates between personalized recommendations, friend opinions, and community consensus.

## Popular Dishes Section
- Heading "Popular dishes" on left in bold text; "See all photos" link on right in teal color for navigation.
- Horizontal photo carousel displaying at least three rectangular photos showcasing signature food items - visible items include what appears to be pizza slices and beverages in glasses.
- Each photo has rounded corners (approximately 8px radius) and maintains consistent spacing between items, creating a cohesive visual gallery.
- Photos appear to be user-generated content or professional food photography, showing actual dishes available at the restaurant.
- The carousel likely supports horizontal scrolling to view additional popular dishes beyond the initially visible three items.
- This section provides visual appetite appeal and helps users understand what to expect from the restaurant's offerings.

## Bottom Navigation Bar
- Five icons with labels from left to right: Feed, Your Lists, Search (center plus sign button, circular), Leaderboard, Profile.
- Search tab is currently active/highlighted as a teal circle with white plus icon, slightly elevated above the tab bar surface to signal primary action and current state.
- The other four tabs (Feed, Your Lists, Leaderboard, Profile) use outline icons in gray color, indicating inactive states.
- Each tab has both an icon and text label positioned vertically, following standard iOS/Android navigation patterns.
- The tab bar has a subtle separator line at the top and likely includes a home indicator bar at the bottom for gesture navigation.
- The Search tab's prominent styling suggests it's the primary action point for discovering restaurants and content within the app.

## Typography & Color Notes
- Primary heading uses bold serif typography (restaurant name) while most other text uses sans-serif.
- Teal (#0A6C70 or similar) appears on interactive elements, tags, and the tab bar highlight.
- Gray tones differentiate metadata from emphasis text.
- Ratings display uses green (#2CBA78) for the main bubble and teal for score context.

## Iconography & Visual Accents
- Ionicon-style outline icons dominate (chevrons, phones, bells, share, more, etc.).
- Overlapping avatars have white borders, mimicking iOS/Instagram friend lists.
- Shadowing is subtle—floating buttons and score circles cast soft drop shadows.

## Interactivity Implied
- Back button allows returning to previous view.
- Floating plus likely adds to list/bookmark; bookmark icon suggests saving intent.
- Website/Call/Directions buttons imply direct integration with external actions.
- “See all scores” and “See all photos” provide deeper navigation into subviews.

## Spacing and Layout Patterns
- The screen follows consistent vertical rhythm with approximately 20-24px spacing between major sections.
- Horizontal padding appears to be 16-20px from screen edges for most content sections.
- The map section extends full-width to the edges, creating visual impact and immediate context.
- Text elements within sections use tighter spacing (8-12px) to create clear groupings.
- Action buttons and interactive elements have generous touch targets (44px+ height) following accessibility guidelines.
- The floating action buttons (plus and bookmark) are positioned with adequate margins from screen edges for thumb accessibility.

## Missing/Implied Features
- **Scrolling behavior**: The content appears to extend beyond the visible screen, suggesting the entire page is vertically scrollable with the map likely remaining fixed or having parallax scrolling behavior.
- **Loading states**: Not visible in this static view, but the app would need loading indicators for map tiles, restaurant data, and photos.
- **Error states**: No error handling UI is visible, but the app would need fallback states for failed map loads, missing photos, or network issues.
- **Accessibility features**: Text appears to follow proper contrast ratios and sizing for readability, though specific accessibility affordances aren't visible in the static design.

## Content Hierarchy Summary
1. **Map & Overlays** — immediate context and navigation controls.
2. **Restaurant Identity** — name, rating, rating count.
3. **Qualitative Tags** — quick descriptors of occasion/needs.
4. **Fact Box** — price tier, cuisine, location, friend interest.
5. **Primary Actions** — website, call, directions.
6. **Scores** — three key metrics with sample sizes.
7. **Visual Dishes** — imagery preview of signature items.
8. **Global Navigation** — tab bar for app-level context.

This hierarchy mirrors typical mobile detail pages with emphasis on quick context, actionable insights, and visual persuasion while maintaining clear information architecture and user flow optimization.
