export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number; // 0-10 scale
  title?: string;
  content: string;
  photos: string[];
  tags: string[];
  visitDate: Date;
  createdAt: Date;
  helpfulCount: number;
  isVerifiedVisit: boolean;
  companions?: string[]; // user IDs
  orderItems?: string[];
}

export const mockReviews: Review[] = [
  {
    id: '1',
    userId: '4', // Emma Rodriguez
    restaurantId: '10', // Le Bernardin
    rating: 9.5,
    title: 'A Transcendent Dining Experience',
    content: 'Le Bernardin continues to set the standard for seafood fine dining. From the moment you enter, the service is impeccable and the attention to detail is extraordinary. The tuna tartare was like butter, perfectly seasoned with just enough acidity to brighten the fish. The black bass was cooked to absolute perfection - crispy skin, flaky interior. Chef Le Coze has created something truly special here. Worth every penny for a special occasion.',
    photos: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    ],
    tags: ['Michelin Star', 'Seafood', 'Fine Dining', 'Special Occasion', 'Perfect'],
    visitDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-07'),
    helpfulCount: 23,
    isVerifiedVisit: true,
    orderItems: ['Tuna Tartare', 'Black Bass', 'Lobster', 'Chocolate Tart'],
  },
  {
    id: '2',
    userId: '5', // Alex Johnson
    restaurantId: '2', // Prince Street Pizza
    rating: 9.2,
    title: 'Pizza Perfection in Nolita',
    content: 'After trying over 100 pizza places in NYC, Prince Street Pizza still reigns supreme for me. The pepperoni slice is everything you want in a NY slice - crispy bottom, perfect cheese-to-sauce ratio, and those pepperoni cups that hold little pools of oil. Yes, you\'ll wait in line, but it\'s worth every minute. The Sicilian square is also excellent if you want something different.',
    photos: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    ],
    tags: ['Best Pizza', 'Pepperoni', 'Worth the Wait', 'NYC Classic'],
    visitDate: new Date('2024-01-14'),
    createdAt: new Date('2024-01-14'),
    helpfulCount: 45,
    isVerifiedVisit: true,
    orderItems: ['Pepperoni Slice', 'Sicilian Square'],
  },
  {
    id: '3',
    userId: '2', // Sarah Kim
    restaurantId: '27', // Blue Hill
    rating: 9.5,
    title: 'Vegetables Have Never Tasted So Good',
    content: 'As a vegetarian, I\'m often disappointed by restaurants that treat vegetables as an afterthought. Blue Hill is the complete opposite - vegetables are the star here, and they deserve the spotlight. Every dish was a revelation. The carrot course was so complex and flavorful I couldn\'t believe it was just carrots. The farm-to-table concept is executed flawlessly. This is the future of fine dining.',
    photos: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    ],
    tags: ['Vegetarian', 'Farm-to-Table', 'Innovation', 'Incredible', 'Future'],
    visitDate: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    helpfulCount: 31,
    isVerifiedVisit: true,
    orderItems: ['Carrot Course', 'Beet Salad', 'Seasonal Tasting Menu'],
  },
  {
    id: '4',
    userId: '3', // Mike Chen
    restaurantId: '6', // Momofuku Noodle Bar
    rating: 8.9,
    title: 'Spice Level: Perfect',
    content: 'Finally found a ramen place that understands spice! The ramen here has incredible depth of flavor and just the right amount of heat. The pork buns are legendary for a reason - soft, pillowy buns with perfectly braised pork belly. David Chang revolutionized ramen in NYC and this place still delivers. Can get crowded but worth the wait.',
    photos: [
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400',
    ],
    tags: ['Spicy', 'Ramen', 'Pork Buns', 'David Chang', 'Revolutionary'],
    visitDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    helpfulCount: 18,
    isVerifiedVisit: true,
    companions: ['7'],
    orderItems: ['Ramen', 'Pork Buns', 'Chilled Spicy Noodles'],
  },
  {
    id: '5',
    userId: '9', // Carlos Martinez
    restaurantId: '19', // Peter Luger
    rating: 9.0,
    title: 'Brooklyn\'s Best Steakhouse',
    content: 'This is how steak should be done. The porterhouse for two was cooked to absolute perfection - charred outside, perfectly pink inside. The bacon appetizer is a must-order (trust me on this). Yes, it\'s cash only and the service can be brusque, but that\'s part of the charm. This place has been doing steak right for over 130 years and it shows.',
    photos: [
      'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
    ],
    tags: ['Steak', 'Porterhouse', 'Cash Only', 'Brooklyn', 'Historic'],
    visitDate: new Date('2024-01-06'),
    createdAt: new Date('2024-01-06'),
    helpfulCount: 28,
    isVerifiedVisit: true,
    companions: ['18'],
    orderItems: ['Porterhouse for Two', 'Bacon', 'German Fried Potatoes'],
  },
  {
    id: '6',
    userId: '11', // Ryan Tanaka
    restaurantId: '24', // Ivan Ramen
    rating: 8.8,
    title: 'Finally, Authentic Ramen in NYC',
    content: 'Having lived in Tokyo for two years, I\'m pretty picky about ramen. Ivan Ramen gets it right. The triple pork ramen has that deep, rich tonkotsu flavor I\'ve been craving. The noodles have the perfect chew and the chashu melts in your mouth. This is what ramen should taste like. Skip the touristy places and come here.',
    photos: [
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400',
    ],
    tags: ['Authentic', 'Ramen', 'Triple Pork', 'Tokyo Quality', 'Real Deal'],
    visitDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    helpfulCount: 22,
    isVerifiedVisit: true,
    orderItems: ['Triple Pork Ramen', 'Mazesoba', 'Pork Buns'],
  },
  {
    id: '7',
    userId: '6', // Lucia Rossi
    restaurantId: '14', // Locanda Verde
    rating: 8.7,
    title: 'Nonna Would Approve',
    content: 'As someone who grew up in Italy, I\'m extremely critical of Italian restaurants in NYC. Locanda Verde passes the test. The sheep\'s milk ricotta transported me back to my childhood in Tuscany. The pasta is made fresh daily and you can taste the difference. The short rib was fall-off-the-bone tender. Finally, Italian food that respects the tradition.',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    ],
    tags: ['Authentic Italian', 'Fresh Pasta', 'Ricotta', 'Tuscany', 'Tradition'],
    visitDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    helpfulCount: 35,
    isVerifiedVisit: true,
    orderItems: ['Sheep\'s Milk Ricotta', 'Short Rib', 'Lobster Fra Diavolo'],
  },
  {
    id: '8',
    userId: '15', // Nina Kowalski
    restaurantId: '23', // Taverna Kyclades
    rating: 8.7,
    title: 'Astoria\'s Hidden Seafood Gem',
    content: 'The trip to Astoria is absolutely worth it for this place. The grilled octopus was the best I\'ve had outside of Greece - tender, perfectly charred, with just olive oil and lemon. The whole fish was incredibly fresh and simply prepared to let the fish shine. The Greek salad with real feta was perfection. This is what Greek seafood should taste like.',
    photos: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',
    ],
    tags: ['Greek', 'Seafood', 'Octopus', 'Fresh Fish', 'Worth the Trip'],
    visitDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    helpfulCount: 16,
    isVerifiedVisit: true,
    orderItems: ['Grilled Octopus', 'Whole Branzino', 'Greek Salad', 'Baklava'],
  },
  {
    id: '9',
    userId: '1', // Tor Cox
    restaurantId: '5', // Katz's Delicatessen
    rating: 8.3,
    title: 'Tourist Trap That\'s Actually Worth It',
    content: 'Yes, it\'s touristy. Yes, you\'ll wait. But the pastrami sandwich is legitimately incredible. The meat is piled high, perfectly seasoned, and melts in your mouth. The pickles are the perfect acidic counterpoint. Sure, you can get a good pastrami sandwich elsewhere for less money, but this is the original and it still delivers. Go at least once.',
    photos: [
      'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400',
    ],
    tags: ['Pastrami', 'Tourist', 'Original', 'Worth It', 'NYC Institution'],
    visitDate: new Date('2023-12-20'),
    createdAt: new Date('2023-12-20'),
    helpfulCount: 41,
    isVerifiedVisit: true,
    orderItems: ['Pastrami Sandwich', 'Pickles', 'Dr. Brown\'s Soda'],
  },
  {
    id: '10',
    userId: '17', // Rachel Green
    restaurantId: '27', // Blue Hill
    rating: 9.6,
    title: 'Plant-Based Fine Dining Perfection',
    content: 'This restaurant proves that plant-based cuisine can be just as sophisticated and delicious as any traditional fine dining. Every course was innovative and surprising. The way they transform simple vegetables into complex, flavorful dishes is pure artistry. As a vegan, I rarely get to experience this level of culinary excellence. This should be a model for restaurants everywhere.',
    photos: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    ],
    tags: ['Vegan', 'Plant-Based', 'Innovation', 'Artistry', 'Model Restaurant'],
    visitDate: new Date('2024-01-09'),
    createdAt: new Date('2024-01-09'),
    helpfulCount: 29,
    isVerifiedVisit: true,
    orderItems: ['Vegetable Tasting Menu', 'Seasonal Vegetables'],
  },
  {
    id: '11',
    userId: '12', // Olivia Thompson
    restaurantId: '10', // Le Bernardin
    rating: 9.3,
    title: 'Wine Pairing Perfection',
    content: 'The sommelier at Le Bernardin is world-class. Each wine pairing elevated the already exceptional seafood to new heights. The Sancerre with the tuna tartare was inspired, and the Burgundy with the lobster was perfection. The service team\'s knowledge of both wine and food is encyclopedic. This is what fine dining should be - flawless execution at every level.',
    photos: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',
    ],
    tags: ['Wine Pairing', 'Sommelier', 'Seafood', 'Flawless', 'World-Class'],
    visitDate: new Date('2024-01-08'),
    createdAt: new Date('2024-01-08'),
    helpfulCount: 19,
    isVerifiedVisit: true,
    orderItems: ['Tuna Tartare', 'Lobster', 'Wine Pairing'],
  },
  {
    id: '12',
    userId: '18', // Marcus Williams
    restaurantId: '4', // Minetta Tavern
    rating: 9.0,
    title: 'The Black Label Burger Lives Up to the Hype',
    content: 'I\'ve had a lot of burgers in this city, but nothing compares to the Black Label Burger at Minetta Tavern. The dry-aged beef blend creates this incredible depth of flavor that you just can\'t get anywhere else. It\'s expensive for a burger, but it\'s not really a burger - it\'s an experience. The bone marrow appetizer is also incredible.',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    ],
    tags: ['Black Label Burger', 'Dry-Aged Beef', 'Experience', 'Bone Marrow', 'Worth It'],
    visitDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    helpfulCount: 33,
    isVerifiedVisit: true,
    orderItems: ['Black Label Burger', 'Bone Marrow', 'Fries'],
  },
  {
    id: '13',
    userId: '8', // Jessica Wu
    restaurantId: '27', // Blue Hill
    rating: 9.2,
    title: 'Clean Eating at Its Finest',
    content: 'Finally, a restaurant that proves healthy food doesn\'t have to be boring! Every dish was vibrant, flavorful, and made me feel good about what I was eating. The way they prepare vegetables here should be taught in culinary schools. No heavy creams or excess fats needed when you have this level of technique and quality ingredients.',
    photos: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    ],
    tags: ['Healthy', 'Clean Eating', 'Vegetables', 'Technique', 'Quality'],
    visitDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11'),
    helpfulCount: 25,
    isVerifiedVisit: true,
    orderItems: ['Vegetable Tasting Menu'],
  },
  {
    id: '14',
    userId: '7', // David Park
    restaurantId: '11', // Halal Guys
    rating: 7.8,
    title: 'Late Night NYC Institution',
    content: 'When you need food at 2 AM and want something that won\'t break the bank, Halal Guys delivers every time. The chicken and rice combo with white sauce and hot sauce is the perfect drunk food. It\'s not gourmet, but it doesn\'t pretend to be. It\'s honest, filling, and always hits the spot.',
    photos: [
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
    ],
    tags: ['Late Night', 'Cheap Eats', 'White Sauce', 'Filling', 'Honest'],
    visitDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    helpfulCount: 12,
    isVerifiedVisit: true,
    orderItems: ['Chicken & Rice', 'White Sauce', 'Hot Sauce'],
  },
  {
    id: '15',
    userId: '10', // Maya Patel
    restaurantId: '15', // Daniel
    rating: 9.4,
    title: 'Dessert Dreams Come True',
    content: 'The chocolate soufflé at Daniel is worth the 20-minute wait. Light as air but intensely chocolatey, with a molten center that flows like lava. The pastry team here is world-class. Every dessert is a work of art, but they never sacrifice flavor for presentation. This is what fine dining desserts should be.',
    photos: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    ],
    tags: ['Dessert', 'Chocolate Soufflé', 'World-Class', 'Art', 'Perfect'],
    visitDate: new Date('2024-01-05'),
    createdAt: new Date('2024-01-05'),
    helpfulCount: 27,
    isVerifiedVisit: true,
    orderItems: ['Chocolate Soufflé', 'Tasting Menu'],
  },
];