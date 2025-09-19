import { List } from '../../types';

export const mockLists: List[] = [
  // Featured/Curated Lists
  {
    id: 'featured-1',
    userId: 'admin',
    name: 'Top 10 NYC Pizza Places',
    description: 'The ultimate guide to the best pizza slices in the five boroughs',
    restaurants: ['2', '3', '20', '26'], // Prince Street, Joe's, L'industrie, Artichoke
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'featured-2',
    userId: 'admin',
    name: 'Michelin Star Restaurants',
    description: 'NYC\'s finest dining establishments with Michelin recognition',
    restaurants: ['10', '12', '15', '25'], // Le Bernardin, Eleven Madison Park, Daniel, NoMad
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'featured-3',
    userId: 'admin',
    name: 'Best Date Night Spots',
    description: 'Romantic restaurants perfect for special occasions',
    restaurants: ['1', '4', '10', '14', '15', '21'], // Balthazar, Minetta, Le Bernardin, Locanda Verde, Daniel, Cecconi's
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'featured-4',
    userId: 'admin',
    name: 'Late Night Eats',
    description: 'Where to eat when everything else is closed',
    restaurants: ['3', '11', '18', '26', '28'], // Joe's Pizza, Halal Guys, Gray's Papaya, Artichoke, Mamoun's
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'featured-5',
    userId: 'admin',
    name: 'Hidden Gems',
    description: 'Under-the-radar spots that deserve more attention',
    restaurants: ['22', '23', '24', '8'], // Al di La, Taverna Kyclades, Ivan Ramen, Xi'an Famous Foods
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'featured-6',
    userId: 'admin',
    name: 'Vegetarian Paradise',
    description: 'Plant-based dining done right',
    restaurants: ['27', '12'], // Blue Hill, Eleven Madison Park
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'featured-7',
    userId: 'admin',
    name: 'Budget-Friendly Favorites',
    description: 'Great food that won\'t break the bank (under $15)',
    restaurants: ['3', '8', '9', '11', '13', '18', '26', '28'], // Joe's, Xi'an, Joe's Shanghai, Halal Guys, Shake Shack, Gray's, Artichoke, Mamoun's
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-06'),
  },

  // User-created lists
  {
    id: 'user-1-been',
    userId: '1', // Tor Cox
    name: 'Been',
    description: 'Restaurants I\'ve visited',
    restaurants: ['1', '3', '5'], // Based on user relations
    isPublic: false,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'user-1-want-to-try',
    userId: '1', // Tor Cox
    name: 'Want to Try',
    description: 'Restaurants on my bucket list',
    restaurants: ['12', '10', '20'], // Based on user relations
    isPublic: false,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user-1-date-night',
    userId: '1', // Tor Cox
    name: 'Perfect Date Spots',
    description: 'My go-to restaurants for romantic dinners',
    restaurants: ['1', '10', '14', '15'],
    isPublic: true,
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'user-2-vegetarian',
    userId: '2', // Sarah Kim
    name: 'Vegetarian Gems',
    description: 'Amazing plant-based dining in NYC',
    restaurants: ['27', '12', '30'],
    isPublic: true,
    createdAt: new Date('2022-09-10'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'user-5-pizza-tour',
    userId: '5', // Alex Johnson
    name: 'NYC Pizza Quest',
    description: 'Rating every pizza place in the city',
    restaurants: ['2', '3', '20', '26'],
    isPublic: true,
    createdAt: new Date('2022-07-01'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'user-6-authentic-italian',
    userId: '6', // Lucia Rossi
    name: 'Nonna-Approved Italian',
    description: 'Authentic Italian restaurants that remind me of home',
    restaurants: ['14', '21', '22'],
    isPublic: true,
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'user-7-cheap-eats',
    userId: '7', // David Park
    name: 'Best Bang for Buck',
    description: 'Amazing food under $10',
    restaurants: ['3', '8', '11', '18', '28'],
    isPublic: true,
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user-9-steakhouses',
    userId: '9', // Carlos Martinez
    name: 'Meat Paradise',
    description: 'The best steaks and BBQ in the city',
    restaurants: ['19', '4'],
    isPublic: true,
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    id: 'user-11-ramen-spots',
    userId: '11', // Ryan Tanaka
    name: 'Authentic Ramen',
    description: 'Real ramen spots that remind me of Tokyo',
    restaurants: ['24', '6'],
    isPublic: true,
    createdAt: new Date('2022-08-10'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'user-12-wine-pairings',
    userId: '12', // Olivia Thompson
    name: 'Wine Lover\'s Guide',
    description: 'Restaurants with exceptional wine programs',
    restaurants: ['10', '15', '25'],
    isPublic: true,
    createdAt: new Date('2021-11-01'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'user-13-brunch-spots',
    userId: '13', // Jamie Foster
    name: 'Weekend Brunch',
    description: 'Best brunch spots for bottomless mimosas',
    restaurants: ['1', '17', '30'],
    isPublic: true,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: 'user-15-seafood',
    userId: '15', // Nina Kowalski
    name: 'Fresh Catch',
    description: 'Best seafood restaurants in NYC',
    restaurants: ['10', '23'],
    isPublic: true,
    createdAt: new Date('2022-12-01'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'user-17-vegan-eats',
    userId: '17', // Rachel Green
    name: 'Plant-Powered Dining',
    description: '100% plant-based restaurants and dishes',
    restaurants: ['27', '12'],
    isPublic: true,
    createdAt: new Date('2022-07-15'),
    updatedAt: new Date('2024-01-09'),
  },
  {
    id: 'user-18-burger-quest',
    userId: '18', // Marcus Williams
    name: 'Burger Journey',
    description: 'Testing every burger in the five boroughs',
    restaurants: ['4', '13'],
    isPublic: true,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-11'),
  },
];

// Helper function to get lists by type for a user
export const getUserListsByType = (userId: string, type: 'been' | 'want_to_try' | 'recs' | 'playlists') => {
  switch (type) {
    case 'been':
      return mockLists.filter(list =>
        list.userId === userId && list.name === 'Been'
      );
    case 'want_to_try':
      return mockLists.filter(list =>
        list.userId === userId && list.name === 'Want to Try'
      );
    case 'recs':
      return mockLists.filter(list =>
        list.userId === userId &&
        list.name !== 'Been' &&
        list.name !== 'Want to Try' &&
        list.isPublic
      );
    case 'playlists':
      return mockLists.filter(list =>
        list.userId === userId &&
        list.name !== 'Been' &&
        list.name !== 'Want to Try'
      );
    default:
      return [];
  }
};

// Featured lists that appear on the home feed
export const featuredLists = mockLists.filter(list => list.userId === 'admin');