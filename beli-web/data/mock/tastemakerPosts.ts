import { TastemakerPost } from '@/types';

export const mockTastemakerPosts: TastemakerPost[] = [
  {
    id: 'post-1',
    userId: 'tm-1', // Alex Pizza King
    title: 'The Ultimate NYC Pizza Slice Guide',
    subtitle: 'After trying 100+ pizzerias, here are the 10 slices you absolutely need to try',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=600&fit=crop',
    content: `I've spent the last three years on a mission: to find the perfect New York slice. After visiting over 100 pizzerias across all five boroughs, I've finally narrowed it down to my top 10.

**What Makes a Great Slice?**

The perfect slice is all about balance. You need a crispy, slightly charred crust that still has that perfect chew. The sauce should be bright and tangy, never too sweet. And the cheese? It needs to have that perfect stretch and just a hint of browning.

**My Top 3 Picks:**

1. **Prince Street Pizza** - That pepperoni square is legendary for a reason. The crispy edges, the spicy cups of pepperoni, the perfect sauce-to-cheese ratio... it's everything a slice should be.

2. **Joe's Pizza** - The classic New York slice. Nothing fancy, just perfect execution every single time. Foldable, greasy in the best way, and always consistent.

3. **L'industrie Pizzeria** - Brooklyn's best kept secret (well, not so secret anymore). Their vodka slice is genuinely life-changing.

**The Dark Horses:**

Don't sleep on Artichoke Basille's - yes, it's touristy, but that artichoke slice is genuinely unique and delicious. And if you're in Brooklyn late night, L'industrie is your spot.

**Pro Tips:**
- Always get your slice reheated
- The fold is essential - structural integrity matters
- Peak hours (lunch and late night) = freshest pies
- Don't be afraid to ask when the last pie came out

Trust me on these. Your taste buds will thank you.`,
    restaurantIds: ['2', '3', '20', '26'], // Prince Street, Joe's, L'industrie, Artichoke
    listIds: ['featured-1', 'user-5-pizza-tour'],
    tags: ['pizza', 'classic-nyc', 'budget-friendly', 'must-try'],
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    interactions: {
      likes: ['1', '2', '3', '5', '9', '18'],
      bookmarks: ['1', '3', '5'],
      views: 3542,
    },
    isFeatured: true,
  },
  {
    id: 'post-2',
    userId: 'tm-2', // Emma Fine Dining
    title: 'Where to Take Your Partner for Anniversary Dinner',
    subtitle: 'Seven restaurants that will make your special night unforgettable',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop',
    content: `Anniversary dinners are pressure. You want somewhere special, somewhere memorable, but also somewhere that feels personal and not just expensive for expensive's sake.

After reviewing NYC's fine dining scene for five years, here are my go-to recommendations for that perfect anniversary meal.

**For the Classics:**

**Le Bernardin** is the move if your partner loves seafood. The tasting menu is flawless, and the service makes you feel like royalty without being stuffy. Book the table by the window if you can.

**Eleven Madison Park** - Yes, it's fully plant-based now, but trust me on this one. Even carnivores will be blown away. The creativity and execution are next level.

**For Romance with a View:**

**Cecconi's** in Dumbo gives you stunning Manhattan skyline views. The pasta is excellent, and the atmosphere is sophisticated but not intimidating.

**The Secret Weapon:**

Here's my insider tip: **Daniel** on the Upper East Side. Everyone talks about the Michelin stars, but what makes it special is the warmth of the service. They make you feel like you're the only table in the room.

**Budget-Conscious but Still Special:**

**Locanda Verde** in Tribeca. It's Robert De Niro's place, so you get that celebrity cachet, but the prices are surprisingly reasonable for the quality. The sheep's milk ricotta is a must-order.

**Pro Tips:**
- Book at least 3-4 weeks in advance
- Mention it's an anniversary when booking - you'd be surprised how much extra attention you get
- Dress up - it's part of the experience
- Don't skip dessert at any of these places`,
    restaurantIds: ['10', '12', '15', '21', '14'],
    listIds: ['featured-3'],
    tags: ['fine-dining', 'date-night', 'special-occasion', 'romantic'],
    publishedAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    interactions: {
      likes: ['1', '4', '6', '10', '12'],
      bookmarks: ['1', '4', '10'],
      views: 2876,
    },
    isFeatured: true,
  },
  {
    id: 'post-3',
    userId: 'tm-3', // David Street Food
    title: 'Eating Like a King on $30 a Day',
    subtitle: 'A full day of incredible NYC meals without breaking the bank',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=600&fit=crop',
    content: `Everyone thinks you need to spend big money to eat well in NYC. I'm here to prove them wrong.

Here's my perfect $30 food day - three incredible meals that will leave you satisfied and your wallet happy.

**Breakfast: $8**
Hit up any bodega for a bacon, egg, and cheese on a roll ($4) and a coffee ($2). But the real move? Add a hash brown inside the sandwich ($2 extra). Game changer.

**Lunch: $12**
**The Halal Guys** - Yeah, it's famous now, but there's a reason for that. The combo platter with chicken and lamb over rice is $12 and will fuel you for hours. Extra white sauce is mandatory.

**Dinner: $10**
**Mamoun's Falafel** in the Village. The falafel sandwich is $6, and it's perfect. Add a side of baba ganoush ($4) and you're set. Been going here for years and it never disappoints.

**The Wildcard:**

If you want to swap lunch for something different, **Xi'an Famous Foods** is my go-to. The spicy cumin lamb noodles are $11 and will ruin you for other noodles.

**Late Night Bonus:**

Got a few extra bucks? **Joe's Pizza** for a $3 slice. Or if you're in Midtown late, **Gray's Papaya** hot dogs are $2.95 each. Two dogs and a papaya drink is the move.

**The Real Secret:**

The best cheap eats in NYC aren't about finding "hidden gems" - they're about recognizing that some places became famous because they're just that good. Don't be a snob about touristy spots if the food slaps.

Trust these spots. I've eaten at all of them at least 50 times.`,
    restaurantIds: ['11', '28', '8', '3', '18'],
    listIds: ['featured-7', 'user-7-cheap-eats'],
    tags: ['budget-friendly', 'street-food', 'quick-bites', 'authentic'],
    publishedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    interactions: {
      likes: ['1', '3', '7', '9', '13', '14', '18'],
      bookmarks: ['1', '7', '13'],
      views: 4231,
    },
    isFeatured: true,
  },
  {
    id: 'post-4',
    userId: 'tm-4', // Rachel Vegan
    title: 'Plant-Based Fine Dining Has Arrived',
    subtitle: 'NYC\'s vegan scene is finally getting the respect it deserves',
    coverImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=600&fit=crop',
    content: `Remember when vegan fine dining meant a sad portobello mushroom "steak"? Yeah, those days are over.

NYC's plant-based dining scene has evolved dramatically, and it's not just for vegans anymore. These restaurants are destinations in their own right.

**The Game Changers:**

**Eleven Madison Park** going fully plant-based was the moment everything changed. It's not vegan food trying to be fancy - it's fine dining that happens to be vegan. The caviar made from kelp? Genuinely incredible.

**Blue Hill** has always been ahead of the curve on vegetables. Dan Barber understands that vegetables don't need to pretend to be meat - they're delicious on their own.

**Why This Matters:**

For too long, vegan options at nice restaurants were afterthoughts. Now, chefs are actually excited about the creative challenge. And the results are stunning.

**What to Order:**

At Eleven Madison Park, trust the tasting menu completely. Every course is a revelation.

At Blue Hill, anything with vegetables from their farm is guaranteed to be peak freshness and flavor.

**The Real Talk:**

Yes, these places are expensive. But you're paying for innovation, creativity, and execution at the highest level. Plus, you're supporting restaurants that are proving plant-based cuisine deserves a seat at the fine dining table.

**For the Skeptics:**

If you think vegan food can't be craveable or indulgent, these restaurants will change your mind. I've seen hardcore meat-eaters leave these places genuinely impressed.

Give them a shot. Your taste buds (and the planet) will thank you.`,
    restaurantIds: ['12', '27'],
    listIds: ['featured-6', 'user-2-vegetarian', 'user-17-vegan-eats'],
    tags: ['vegan', 'plant-based', 'fine-dining', 'sustainable'],
    publishedAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    interactions: {
      likes: ['2', '4', '8', '12', '17'],
      bookmarks: ['2', '8', '17'],
      views: 2134,
    },
    isFeatured: false,
  },
  {
    id: 'post-5',
    userId: 'tm-5', // Ryan Ramen
    title: 'Real Ramen vs. The Hype: A Tokyo Native\'s Take',
    subtitle: 'What NYC gets right (and wrong) about ramen',
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=600&fit=crop',
    content: `I lived in Tokyo for four years, eating ramen almost daily. Now I'm in NYC, and I have thoughts.

**The Good News:**

NYC's ramen scene has improved dramatically. There are legit spots now that would hold their own in Tokyo.

**Ivan Ramen** is the real deal. Ivan Orkin earned his stripes in Tokyo, and it shows. The triple-garlic triple-pork mazemen is as good as anything in Japan.

**Ippudo** expanded from Fukuoka and maintained quality. The akamaru modern is exactly what it should be - rich, complex, with that perfect noodle chew.

**What Most Places Get Wrong:**

1. **The Broth** - Many NYC spots make their broth too thick, thinking richness = authenticity. Real tonkotsu should be creamy but balanced.

2. **The Noodles** - If they're mushy, the whole bowl fails. Noodles should have bite (what we call "koshi" in Japanese).

3. **The Toppings** - Chashu should be melt-in-your-mouth tender. Too many places serve it cold or dry.

**My Hot Take:**

Stop ordering extra toppings. A proper ramen bowl is balanced as designed. Adding extra this and that throws off the ratio that the chef carefully planned.

**The Spots Worth Your Time:**

Start with Ivan Ramen or Ippudo. If you like what you taste, then branch out. But please, skip the trendy spots with weird fusion bowls. That's not ramen - that's noodle soup with an identity crisis.

**Pro Tips:**
- Eat ramen fresh - it's meant to be eaten immediately
- The counter seats are best - watch the chefs work
- Don't slurp just for show - it actually aerates the broth
- Finish in under 10 minutes - noodles keep cooking in the hot broth`,
    restaurantIds: ['24', '6'],
    listIds: ['user-11-ramen-spots'],
    tags: ['ramen', 'japanese', 'authentic', 'noodles'],
    publishedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    interactions: {
      likes: ['1', '5', '11', '16'],
      bookmarks: ['1', '11'],
      views: 1876,
    },
    isFeatured: false,
  },
  {
    id: 'post-6',
    userId: 'tm-6', // Jamie Brunch
    title: 'The Definitive NYC Brunch Power Rankings',
    subtitle: 'Where to spend your Saturday morning (and yes, bottomless matters)',
    coverImage: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&h=600&fit=crop',
    content: `Brunch is serious business in NYC. After three years of weekend research (somebody's gotta do it), here are my definitive rankings.

**The Elite Tier:**

**Balthazar** - The French toast is iconic for a reason, and the scene is unmatched. Yes, it's busy. Yes, it's loud. That's the point. Go at 11am on Saturday.

**Jack's Wife Freda** - Mediterranean vibes, incredible shakshuka, and the best people-watching in the city. The rosewater waffles will change your life.

**The "Worth the Wait" Tier:**

**Clinton Street Baking Co.** - The pancakes. Just trust me on the pancakes. Worth the hour-plus wait.

**The Underrated Gems:**

**Westville** - Multiple locations, never a crazy wait, and surprisingly great brunch. The market plate is my go-to move.

**Let's Talk Bottomless:**

Look, I'm a bottomless mimosa advocate. Best bang for buck? **The Smith** - good food, solid drinks, reasonable price point.

**The Hot Take:**

Eggs Benedict is overrated. There, I said it. Unless the hollandaise is made fresh to order, skip it.

**My Perfect Brunch Order:**

- Start with coffee (obvious)
- Something savory as the main (pancakes for dessert > pancakes for breakfast)
- Share a sweet thing with the table
- Bloody Mary if you're feeling fancy, mimosa if you're feeling fun

**Pro Tips:**
- Weekday brunch > weekend brunch for avoiding crowds
- Make a reservation or go right at opening
- Skip the Instagram-famous spots unless the food backs it up
- Bring cash for tips - some places are weird about splitting cards

Remember: brunch is a marathon, not a sprint. Pace yourself.`,
    restaurantIds: ['1', '17', '30'],
    listIds: ['user-13-brunch-spots'],
    tags: ['brunch', 'weekend', 'bottomless', 'breakfast'],
    publishedAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    interactions: {
      likes: ['1', '2', '6', '13', '19'],
      bookmarks: ['1', '13'],
      views: 2654,
    },
    isFeatured: false,
  },
  {
    id: 'post-7',
    userId: 'tm-7', // Maya Desserts
    title: 'Sugar Rush: NYC\'s Best Dessert Crawl',
    subtitle: 'A three-stop journey to satisfy every sweet tooth',
    coverImage: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&h=600&fit=crop',
    content: `As a pastry chef, I'm extremely picky about desserts. But these three spots? Absolutely worth the calories.

**Stop 1: The Cookie**
**Levain Bakery** - That half-pound chocolate chip walnut cookie is dangerous. Crispy outside, gooey inside, borderline overwhelming in the best way. Get it warm.

**Stop 2: The Ice Cream**
**Van Leeuwen** - They make their own ice cream from scratch, and it shows. The honeycomb is my personal favorite, but you can't go wrong.

**Stop 3: The Showstopper**
**Dominique Ansel** - Yes, the Cronut is touristy now. Yes, it's still worth it. Or try the DKA (Dominique's Kouign Amann) - fewer people know about it and it's arguably better.

**The Route:**

Start in Harlem at Levain (less crowded than the UWS location). Hit Van Leeuwen in East Village. Finish at Dominique Ansel in Soho. Total walking time between spots: about an hour. Perfect for working off the calories before the next stop.

**Pro Chef Tips:**

At Levain, the cookies are best within 2 hours of baking. Ask when the next batch comes out.

At Van Leeuwen, don't be afraid to ask for samples. Try before you commit.

At Dominique Ansel, weekday mornings = shorter lines.

**The Science:**

Why do these places stand out? Quality ingredients, proper technique, and respect for the craft. You can taste the difference when someone actually knows what they're doing.

**Fair Warning:**

This crawl is not for amateurs. Bring friends. Share everything. Hydrate between stops. Consider it a marathon, not a sprint.

Your dentist might hate me for this guide, but your taste buds will love me.`,
    restaurantIds: ['25', '26', '27'],
    listIds: ['user-1-dessert-playlist'],
    tags: ['dessert', 'sweets', 'bakery', 'foodie-tour'],
    publishedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    interactions: {
      likes: ['1', '10', '13', '20'],
      bookmarks: ['1', '10'],
      views: 1987,
    },
    isFeatured: false,
  },
  {
    id: 'post-8',
    userId: 'tm-8', // Olivia Wine
    title: 'Wine Pairing Doesn\'t Have to Be Pretentious',
    subtitle: 'A sommelier\'s guide to actually enjoying wine with your meal',
    coverImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&h=600&fit=crop',
    content: `Wine culture can be intimidating. As a sommelier, I've seen too many people order the wrong wine because they were afraid to ask questions.

Let's fix that.

**Rule #1: Throw Out "Red with Meat, White with Fish"**

This "rule" is nonsense. A light pinot noir goes beautifully with salmon. A full-bodied white can stand up to chicken. Judge by weight and intensity, not color.

**The Three Restaurants Doing It Right:**

**Le Bernardin** - Their wine program is flawless. But more importantly, their sommeliers actually listen to what you like. Tell them your budget and preferences - they'll guide you perfectly.

**Daniel** - The wine list is intimidating (300+ bottles), but the team is incredible at finding gems in every price range.

**The NoMad** - More casual vibe, but the wine-by-the-glass program is one of the best in the city. Perfect for trying new things without committing to a bottle.

**My Pairing Philosophy:**

Match intensity levels. Delicate dish = delicate wine. Rich dish = full-bodied wine. That's it. Don't overthink it.

**The Best Value Move:**

Ask for the sommelier's pick in your price range. We love when people do this - it shows trust and lets us show off a bit.

**What to Avoid:**

- The second-cheapest wine on the list (restaurants know you'll order this)
- Ordering by region only ("I want Italian") without considering the food
- Being afraid to say you don't like something

**Pro Tips:**
- Taste before accepting - if it's corked, send it back
- The markup on wine is huge - don't be afraid of lower price points
- By-the-glass programs have improved dramatically - don't feel pressured to order bottles
- Natural wine isn't better, just different

Wine should enhance your meal, not complicate it. If you're stressed about the pairing, you're doing it wrong.`,
    restaurantIds: ['10', '15', '25'],
    listIds: ['user-12-wine-pairings'],
    tags: ['wine', 'fine-dining', 'pairing', 'sommelier-tips'],
    publishedAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    interactions: {
      likes: ['1', '4', '12', '15'],
      bookmarks: ['4', '12'],
      views: 1543,
    },
    isFeatured: false,
  },
];

// Helper to get featured posts
export const getFeaturedPosts = (): TastemakerPost[] => {
  return mockTastemakerPosts.filter(post => post.isFeatured);
};

// Helper to get posts by user
export const getPostsByUserId = (userId: string): TastemakerPost[] => {
  return mockTastemakerPosts.filter(post => post.userId === userId);
};

// Helper to get posts by tag
export const getPostsByTag = (tag: string): TastemakerPost[] => {
  return mockTastemakerPosts.filter(post => post.tags.includes(tag));
};
