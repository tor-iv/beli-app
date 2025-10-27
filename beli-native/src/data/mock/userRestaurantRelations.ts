import { UserRestaurantRelation } from '../../types';

export const mockUserRestaurantRelations: UserRestaurantRelation[] = [
  // Tor Cox (user 1) relations
  {
    userId: '1',
    restaurantId: '1', // Balthazar
    status: 'been',
    rating: 8.5,
    notes: 'Great French bistro atmosphere. The steak frites was perfectly cooked.',
    photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
    visitDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    tags: ['Date Night', 'French'],
    companions: ['2'],
  },
  {
    userId: '1',
    restaurantId: '3', // Joe's Pizza
    status: 'been',
    rating: 7.8,
    notes: 'Classic NYC slice. Nothing fancy but hits the spot every time.',
    visitDate: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    tags: ['Quick Bite', 'Late Night'],
  },
  {
    userId: '1',
    restaurantId: '5', // Katz's Delicatessen
    status: 'been',
    rating: 8.3,
    notes: 'Tourist trap but the pastrami sandwich is legendary. Worth the wait.',
    visitDate: new Date('2023-12-20'),
    createdAt: new Date('2023-12-20'),
    tags: ['Iconic', 'Tourist'],
  },
  {
    userId: '1',
    restaurantId: '233', // L'Artusi
    status: 'been',
    rating: 9.1,
    notes: 'Handmade pastas and olive oil cake are must-orders.',
    visitDate: new Date('2024-02-04'),
    createdAt: new Date('2024-02-04'),
    tags: ['Date Night', 'Italian'],
  },
  {
    userId: '1',
    restaurantId: '234', // Anton's
    status: 'been',
    rating: 6.2,
    notes: 'Cozy vibe but some dishes were inconsistent.',
    visitDate: new Date('2024-01-22'),
    createdAt: new Date('2024-01-22'),
    tags: ['Comfort Food'],
  },
  {
    userId: '1',
    restaurantId: '235', // Cowgirl
    status: 'been',
    rating: 3.4,
    notes: 'Fun theme, but food was underwhelming this visit.',
    visitDate: new Date('2023-11-18'),
    createdAt: new Date('2023-11-18'),
    tags: ['Casual'],
  },
  {
    userId: '1',
    restaurantId: '12', // Eleven Madison Park
    status: 'want_to_try',
    notes: 'Need to save up for this one. Heard amazing things about the plant-based menu.',
    createdAt: new Date('2024-01-15'),
    tags: ['Special Occasion', 'Fine Dining'],
  },
  {
    userId: '1',
    restaurantId: '10', // Le Bernardin
    status: 'want_to_try',
    notes: 'Dream restaurant. Maybe for anniversary?',
    createdAt: new Date('2024-01-12'),
    tags: ['Anniversary', 'Michelin Star'],
  },
  {
    userId: '1',
    restaurantId: '20', // L'industrie Pizzeria
    status: 'want_to_try',
    notes: 'Need to try that Instagram famous burrata slice.',
    createdAt: new Date('2024-01-08'),
    tags: ['Instagram Famous', 'Pizza'],
  },
  {
    userId: '1',
    restaurantId: 'thai-villa', // Thai Villa
    status: 'want_to_try',
    notes: 'Heard great things about their pad thai and green curry.',
    createdAt: new Date('2024-02-15'),
    tags: ['Thai', 'Date Night'],
  },
  {
    userId: '1',
    restaurantId: 'bombay-spice', // Bombay Spice
    status: 'want_to_try',
    notes: 'Craving some good Indian food. Butter chicken looks amazing.',
    createdAt: new Date('2024-02-14'),
    tags: ['Indian', 'Vegetarian Options'],
  },
  {
    userId: '1',
    restaurantId: 'ramen-house', // Ramen House
    status: 'want_to_try',
    notes: 'Perfect for a quick comfort food meal. Love a good tonkotsu.',
    createdAt: new Date('2024-02-13'),
    tags: ['Ramen', 'Comfort Food'],
  },
  {
    userId: '1',
    restaurantId: 'la-pecora-bianca', // La Pecora Bianca
    status: 'want_to_try',
    notes: 'That rigatoni vodka has been all over Instagram. Need to try!',
    createdAt: new Date('2024-02-12'),
    tags: ['Italian', 'Pasta'],
  },
  {
    userId: '1',
    restaurantId: 'seoul-kitchen', // Seoul Kitchen
    status: 'want_to_try',
    notes: 'Group dinner spot - Korean BBQ sounds perfect.',
    createdAt: new Date('2024-02-11'),
    tags: ['Korean', 'Group Friendly'],
  },
  {
    userId: '1',
    restaurantId: 'dim-sum-palace', // Dim Sum Palace
    status: 'want_to_try',
    notes: 'Sunday brunch dim sum mission with friends.',
    createdAt: new Date('2024-02-10'),
    tags: ['Chinese', 'Brunch'],
  },
  {
    userId: '1',
    restaurantId: 'tapas-barcelona', // Tapas Barcelona
    status: 'want_to_try',
    notes: 'Perfect for sharing plates and sangria with friends.',
    createdAt: new Date('2024-02-09'),
    tags: ['Spanish', 'Sharing'],
  },

  // Sarah Kim (user 2) relations
  {
    userId: '2',
    restaurantId: '1', // Balthazar
    status: 'been',
    rating: 8.7,
    notes: 'Love the vegetarian options here. The mushroom omelet was divine.',
    visitDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    tags: ['Brunch', 'Vegetarian'],
    companions: ['1'],
  },
  {
    userId: '2',
    restaurantId: '27', // Blue Hill
    status: 'been',
    rating: 9.5,
    notes: 'This is how vegetables should be treated! Every dish was a masterpiece.',
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'],
    visitDate: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    tags: ['Vegetarian', 'Fine Dining', 'Amazing'],
  },
  {
    userId: '2',
    restaurantId: '30', // Sarabeth's
    status: 'been',
    rating: 8.2,
    notes: 'Perfect brunch spot. The lemon ricotta pancakes are fluffy clouds.',
    visitDate: new Date('2023-12-30'),
    createdAt: new Date('2023-12-30'),
    tags: ['Brunch', 'Pancakes'],
  },
  {
    userId: '2',
    restaurantId: '12', // Eleven Madison Park
    status: 'want_to_try',
    notes: 'Plant-based fine dining sounds incredible.',
    createdAt: new Date('2024-01-14'),
    tags: ['Plant-Based', 'Fine Dining'],
  },
  {
    userId: '2',
    restaurantId: 'thai-villa', // Thai Villa
    status: 'want_to_try',
    notes: 'Thai food always has great vegetarian options!',
    createdAt: new Date('2024-02-16'),
    tags: ['Thai', 'Vegetarian Options'],
  },
  {
    userId: '2',
    restaurantId: 'bombay-spice', // Bombay Spice
    status: 'want_to_try',
    notes: 'Love Indian food - so many veggie dishes to choose from.',
    createdAt: new Date('2024-02-15'),
    tags: ['Indian', 'Vegan Options'],
  },
  {
    userId: '2',
    restaurantId: 'vegan-garden', // Vegan Garden
    status: 'want_to_try',
    notes: 'All vegan menu - finally! Need to try the beyond burger.',
    createdAt: new Date('2024-02-14'),
    tags: ['Vegan', 'Healthy'],
  },
  {
    userId: '2',
    restaurantId: 'dim-sum-palace', // Dim Sum Palace
    status: 'want_to_try',
    notes: 'Dim sum brunch with the girls sounds perfect.',
    createdAt: new Date('2024-02-13'),
    tags: ['Chinese', 'Brunch'],
  },

  // Mike Chen (user 3) relations
  {
    userId: '3',
    restaurantId: '6', // Momofuku Noodle Bar
    status: 'been',
    rating: 8.9,
    notes: 'The ramen was incredible! Perfect spice level and the pork buns were amazing.',
    photos: ['https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400'],
    visitDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    tags: ['Ramen', 'Spicy', 'David Chang'],
  },
  {
    userId: '3',
    restaurantId: '8', // Xi'an Famous Foods
    status: 'been',
    rating: 8.5,
    notes: 'Holy spice level! The hand-pulled noodles with cumin lamb blew my mind.',
    visitDate: new Date('2024-01-09'),
    createdAt: new Date('2024-01-09'),
    tags: ['Spicy', 'Hand-Pulled Noodles', 'Authentic'],
  },
  {
    userId: '3',
    restaurantId: '11', // Halal Guys
    status: 'been',
    rating: 7.6,
    notes: 'Classic late night food. The white sauce is addictive.',
    visitDate: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    tags: ['Late Night', 'Street Food'],
  },
  {
    userId: '3',
    restaurantId: '24', // Ivan Ramen
    status: 'want_to_try',
    notes: 'Another ramen spot to check out. Heard the mazesoba is unique.',
    createdAt: new Date('2024-01-13'),
    tags: ['Ramen', 'Unique'],
  },

  // Emma Rodriguez (user 4) relations - Fine dining enthusiast
  {
    userId: '4',
    restaurantId: '10', // Le Bernardin
    status: 'been',
    rating: 9.5,
    notes: 'Perfection. Every course was flawless. The tuna tartare was transcendent.',
    photos: ['https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400'],
    visitDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-07'),
    tags: ['Michelin Star', 'Perfect', 'Seafood'],
  },
  {
    userId: '4',
    restaurantId: '15', // Daniel
    status: 'been',
    rating: 9.3,
    notes: 'Daniel Boulud is a master. The foie gras course was unforgettable.',
    visitDate: new Date('2023-12-28'),
    createdAt: new Date('2023-12-28'),
    tags: ['Michelin Star', 'French', 'Daniel Boulud'],
  },
  {
    userId: '4',
    restaurantId: '25', // The NoMad Restaurant
    status: 'been',
    rating: 9.1,
    notes: 'The roasted chicken is worth the hype. Presentation was stunning.',
    visitDate: new Date('2023-12-15'),
    createdAt: new Date('2023-12-15'),
    tags: ['Fine Dining', 'Hotel Restaurant'],
  },
  {
    userId: '4',
    restaurantId: '12', // Eleven Madison Park
    status: 'want_to_try',
    notes: 'Need to experience the plant-based tasting menu.',
    createdAt: new Date('2024-01-11'),
    tags: ['Plant-Based', 'Tasting Menu'],
  },

  // Alex Johnson (user 5) - Pizza expert
  {
    userId: '5',
    restaurantId: '2', // Prince Street Pizza
    status: 'been',
    rating: 9.2,
    notes: 'Best pepperoni slice in the city. The cheese-to-sauce ratio is perfect.',
    photos: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'],
    visitDate: new Date('2024-01-14'),
    createdAt: new Date('2024-01-14'),
    tags: ['Best Pizza', 'Pepperoni', 'Perfect'],
  },
  {
    userId: '5',
    restaurantId: '3', // Joe's Pizza
    status: 'been',
    rating: 7.8,
    notes: 'Classic NY slice. Reliable but not spectacular.',
    visitDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    tags: ['Classic', 'Reliable'],
  },
  {
    userId: '5',
    restaurantId: '20', // L'industrie Pizzeria
    status: 'been',
    rating: 8.8,
    notes: 'The burrata slice is Instagram worthy and actually tastes amazing.',
    photos: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'],
    visitDate: new Date('2024-01-06'),
    createdAt: new Date('2024-01-06'),
    tags: ['Burrata', 'Instagram', 'Square Slice'],
  },
  {
    userId: '5',
    restaurantId: '26', // Artichoke Basille's Pizza
    status: 'been',
    rating: 7.9,
    notes: 'Heavy but satisfying. The artichoke slice is unique.',
    visitDate: new Date('2024-01-03'),
    createdAt: new Date('2024-01-03'),
    tags: ['Unique', 'Heavy', 'Late Night'],
  },

  // Lucia Rossi (user 6) - Italian expert
  {
    userId: '6',
    restaurantId: '14', // Locanda Verde
    status: 'been',
    rating: 8.7,
    notes: 'Finally, authentic Italian in NYC. The sheep\'s milk ricotta transported me home.',
    visitDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    tags: ['Authentic', 'Italian', 'Ricotta'],
  },
  {
    userId: '6',
    restaurantId: '21', // Cecconi's
    status: 'been',
    rating: 8.5,
    notes: 'Good Italian with beautiful views. The branzino was perfectly prepared.',
    visitDate: new Date('2024-01-09'),
    createdAt: new Date('2024-01-09'),
    tags: ['Views', 'Branzino', 'Waterfront'],
  },
  {
    userId: '6',
    restaurantId: '22', // Al di La Trattoria
    status: 'been',
    rating: 8.6,
    notes: 'Hidden gem in Park Slope. Feels like eating at nonna\'s house.',
    visitDate: new Date('2024-01-04'),
    createdAt: new Date('2024-01-04'),
    tags: ['Hidden Gem', 'Nonna', 'Cozy'],
  },

  // David Park (user 7) - Street food lover
  {
    userId: '7',
    restaurantId: '11', // Halal Guys
    status: 'been',
    rating: 7.8,
    notes: 'Classic street food. Can\'t beat the price and portion size.',
    visitDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    tags: ['Cheap', 'Large Portions', 'Street Food'],
  },
  {
    userId: '7',
    restaurantId: '18', // Gray's Papaya
    status: 'been',
    rating: 7.4,
    notes: '24/7 hot dogs for $1. NYC institution.',
    visitDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    tags: ['24/7', 'Cheap', 'Institution'],
  },
  {
    userId: '7',
    restaurantId: '28', // Mamoun's Falafel
    status: 'been',
    rating: 7.6,
    notes: 'Best late night falafel. The tahini sauce is perfect.',
    visitDate: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    tags: ['Late Night', 'Falafel', 'Tahini'],
  },

  // Jessica Wu (user 8) - Healthy eating
  {
    userId: '8',
    restaurantId: '27', // Blue Hill
    status: 'been',
    rating: 9.2,
    notes: 'This is how vegetables should be celebrated! Every dish was healthy and delicious.',
    visitDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    tags: ['Healthy', 'Vegetables', 'Clean'],
  },
  {
    userId: '8',
    restaurantId: '30', // Sarabeth's
    status: 'been',
    rating: 8.0,
    notes: 'They have great gluten-free options. The fruit salad was fresh.',
    visitDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-07'),
    tags: ['Gluten-Free', 'Fresh', 'Brunch'],
  },

  // Carlos Martinez (user 9) - BBQ lover
  {
    userId: '9',
    restaurantId: '19', // Peter Luger
    status: 'been',
    rating: 9.0,
    notes: 'The porterhouse steak was incredible. This is how beef should be cooked.',
    photos: ['https://images.unsplash.com/photo-1558030006-450675393462?w=400'],
    visitDate: new Date('2024-01-06'),
    createdAt: new Date('2024-01-06'),
    tags: ['Steak', 'Porterhouse', 'Incredible'],
  },
  {
    userId: '9',
    restaurantId: '4', // Minetta Tavern
    status: 'been',
    rating: 8.8,
    notes: 'The Black Label Burger is worth the hype. Perfect char.',
    visitDate: new Date('2024-01-02'),
    createdAt: new Date('2024-01-02'),
    tags: ['Burger', 'Char', 'Worth the Hype'],
  },

  // Maya Patel (user 10) - Dessert enthusiast
  {
    userId: '10',
    restaurantId: '15', // Daniel
    status: 'been',
    rating: 9.4,
    notes: 'The chocolate soufflé was perfect. Light, airy, and intensely chocolatey.',
    visitDate: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    tags: ['Dessert', 'Chocolate', 'Soufflé'],
  },
  {
    userId: '10',
    restaurantId: '30', // Sarabeth's
    status: 'been',
    rating: 8.3,
    notes: 'Their pastries are amazing. The almond croissant was buttery perfection.',
    visitDate: new Date('2024-01-09'),
    createdAt: new Date('2024-01-09'),
    tags: ['Pastries', 'Croissant', 'Buttery'],
  },

  // Ryan Tanaka (user 11) - Ramen expert
  {
    userId: '11',
    restaurantId: '6', // Momofuku Noodle Bar
    status: 'been',
    rating: 8.5,
    notes: 'Good ramen but not authentic. The pork buns are the real star here.',
    visitDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    tags: ['Pork Buns', 'Not Authentic', 'Good'],
  },
  {
    userId: '11',
    restaurantId: '24', // Ivan Ramen
    status: 'been',
    rating: 8.8,
    notes: 'Much more authentic. The triple pork ramen has incredible depth.',
    visitDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    tags: ['Authentic', 'Triple Pork', 'Depth'],
  },

  // Add more relations for other users...
  {
    userId: '12', // Olivia Thompson - Wine enthusiast
    restaurantId: '10', // Le Bernardin
    status: 'been',
    rating: 9.3,
    notes: 'The wine pairing was exceptional. Each wine elevated the seafood perfectly.',
    visitDate: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    tags: ['Wine Pairing', 'Seafood', 'Exceptional'],
  },
  {
    userId: '13', // Jamie Foster - Brunch lover
    restaurantId: '1', // Balthazar
    status: 'been',
    rating: 8.6,
    notes: 'Perfect brunch spot. The French toast was decadent and the mimosas were strong.',
    visitDate: new Date('2024-01-14'),
    createdAt: new Date('2024-01-14'),
    tags: ['Brunch', 'French Toast', 'Mimosas'],
  },
  {
    userId: '15', // Nina Kowalski - Seafood expert
    restaurantId: '23', // Taverna Kyclades
    status: 'been',
    rating: 8.7,
    notes: 'The grilled octopus was tender and perfectly charred. Fresh fish selection.',
    visitDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    tags: ['Octopus', 'Fresh Fish', 'Grilled'],
  },
  {
    userId: '17', // Rachel Green - Vegan
    restaurantId: '27', // Blue Hill
    status: 'been',
    rating: 9.6,
    notes: 'This proves plant-based fine dining can be incredible. Every course was innovative.',
    visitDate: new Date('2024-01-09'),
    createdAt: new Date('2024-01-09'),
    tags: ['Plant-Based', 'Innovative', 'Incredible'],
  },
  {
    userId: '18', // Marcus Williams - Burger lover
    restaurantId: '4', // Minetta Tavern
    status: 'been',
    rating: 9.0,
    notes: 'The Black Label Burger is the best burger in NYC. Period.',
    visitDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    tags: ['Best Burger', 'Black Label', 'NYC'],
  },
  {
    userId: '19', // Sophia Dimitriou - Mediterranean
    restaurantId: '23', // Taverna Kyclades
    status: 'been',
    rating: 8.9,
    notes: 'Reminds me of home in Greece. The olive oil is top quality.',
    visitDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-07'),
    tags: ['Authentic', 'Greece', 'Olive Oil'],
  },
];
