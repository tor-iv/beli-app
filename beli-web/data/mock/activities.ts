
import { mockRestaurants } from './restaurants';
import { mockUsers } from './users';

import type { FeedItem } from '@/types';

export interface Activity extends FeedItem {
  interactions?: {
    likes: string[]; // user IDs who liked this
    comments: ActivityComment[];
    bookmarks: string[]; // user IDs who bookmarked
  };
}

export interface ActivityComment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export const mockActivities: Activity[] = [
  // New activities that match the target design
  {
    id: 'ryan_san_marzano',
    restaurant: mockRestaurants.find((r) => r.id === '31')!, // San Marzano
    user: mockUsers.find((u) => u.displayName === 'Ryan Tanaka')!,
    rating: 9.7,
    comment: 'It was so good and so cheap',
    photos: [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400',
    ],
    tags: ['Ukrainian', 'Good Value'],
    timestamp: new Date(Date.now() - 37 * 60 * 1000), // 37 minutes ago
    type: 'visit',
    interactions: {
      likes: ['1', '3', '6'],
      comments: [],
      bookmarks: ['1'],
    },
  },
  {
    id: 'jack_bookmark_jua',
    restaurant: mockRestaurants.find((r) => r.id === '32')!, // Jua
    user: mockUsers.find((u) => u.id === '21')!, // Jack user
    rating: 0, // No rating for bookmark
    comment: '',
    photos: [],
    tags: [],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'bookmark',
    interactions: {
      likes: [],
      comments: [],
      bookmarks: ['1'],
    },
  },
  {
    id: 'jack_omars_lucas',
    restaurant: mockRestaurants.find((r) => r.id === '33')!, // Omar's Mediterranean Cuisine
    user: mockUsers.find((u) => u.id === '21')!, // Jack user
    companions: [mockUsers.find((u) => u.id === '22')!], // Lucas Jerez
    rating: 7.3,
    comment: "Ok I've always kinda been an Omar's hater but I gotta hand it to them this place...",
    photos: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400',
    ],
    tags: ['Mediterranean', 'Changed Opinion'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'visit',
    interactions: {
      likes: ['1', '4', '7'],
      comments: [],
      bookmarks: ['1', '4'],
    },
  },
  {
    id: '1',
    restaurant: mockRestaurants.find((r) => r.id === '2')!, // Prince Street Pizza
    user: mockUsers.find((u) => u.id === '5')!, // Alex Johnson
    rating: 9.2,
    comment:
      'Finally tried the legendary pepperoni slice! The cheese-to-sauce ratio is absolutely perfect 🍕',
    photos: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'],
    tags: ['Best Pizza', 'Pepperoni', 'Perfect'],
    timestamp: new Date('2024-01-15T14:30:00'),
    type: 'visit',
    interactions: {
      likes: ['1', '3', '6', '9', '12'],
      comments: [
        {
          id: 'c1',
          userId: '1',
          content: 'Been meaning to try this place! Adding to my list 📝',
          timestamp: new Date('2024-01-15T14:45:00'),
        },
        {
          id: 'c2',
          userId: '3',
          content: 'The pepperoni cups are the best part! 🔥',
          timestamp: new Date('2024-01-15T15:00:00'),
        },
      ],
      bookmarks: ['1', '7', '14'],
    },
  },
  {
    id: '2',
    restaurant: mockRestaurants.find((r) => r.id === '10')!, // Le Bernardin
    user: mockUsers.find((u) => u.id === '4')!, // Emma Rodriguez
    rating: 9.5,
    comment: 'An absolutely transcendent dining experience. Every course was flawless ⭐',
    photos: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    ],
    tags: ['Michelin Star', 'Seafood', 'Perfect'],
    timestamp: new Date('2024-01-15T12:15:00'),
    type: 'visit',
    interactions: {
      likes: ['2', '6', '10', '12', '15', '19'],
      comments: [
        {
          id: 'c3',
          userId: '12',
          content: 'The wine pairing here is incredible! Did you do the full pairing?',
          timestamp: new Date('2024-01-15T12:30:00'),
        },
      ],
      bookmarks: ['1', '2', '6'],
    },
  },
  {
    id: '3',
    restaurant: mockRestaurants.find((r) => r.id === '27')!, // Blue Hill
    user: mockUsers.find((u) => u.id === '2')!, // Sarah Kim
    rating: 9.5,
    comment: 'This is how vegetables should be treated! Every dish was a work of art 🎨🌱',
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'],
    tags: ['Vegetarian', 'Farm-to-Table', 'Amazing'],
    timestamp: new Date('2024-01-15T11:00:00'),
    type: 'visit',
    interactions: {
      likes: ['1', '8', '17', '13'],
      comments: [
        {
          id: 'c4',
          userId: '17',
          content: 'YES! Finally a restaurant that gets plant-based dining right! 🙌',
          timestamp: new Date('2024-01-15T11:20:00'),
        },
        {
          id: 'c5',
          userId: '8',
          content: 'Added to my must-try list! Love the farm-to-table concept',
          timestamp: new Date('2024-01-15T11:35:00'),
        },
      ],
      bookmarks: ['8', '17'],
    },
  },
  {
    id: '4',
    restaurant: mockRestaurants.find((r) => r.id === '6')!, // Momofuku Noodle Bar
    user: mockUsers.find((u) => u.id === '3')!, // Mike Chen
    rating: 8.9,
    comment: 'Finally found a ramen place that understands spice! The pork buns are legendary 🍜🔥',
    photos: ['https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400'],
    tags: ['Spicy', 'Ramen', 'Pork Buns'],
    timestamp: new Date('2024-01-14T19:45:00'),
    type: 'visit',
    interactions: {
      likes: ['1', '7', '11', '16'],
      comments: [
        {
          id: 'c6',
          userId: '11',
          content: 'Good ramen but try Ivan Ramen for more authentic flavors!',
          timestamp: new Date('2024-01-14T20:00:00'),
        },
      ],
      bookmarks: ['1', '7'],
    },
  },
  {
    id: '5',
    restaurant: mockRestaurants.find((r) => r.id === '19')!, // Peter Luger
    user: mockUsers.find((u) => u.id === '9')!, // Carlos Martinez
    rating: 9.0,
    comment: 'The porterhouse steak was incredible! This is how beef should be cooked 🥩',
    photos: ['https://images.unsplash.com/photo-1558030006-450675393462?w=400'],
    tags: ['Steak', 'Brooklyn', 'Incredible'],
    timestamp: new Date('2024-01-14T18:30:00'),
    type: 'visit',
    interactions: {
      likes: ['4', '9', '18', '20'],
      comments: [
        {
          id: 'c7',
          userId: '18',
          content: 'The bacon appetizer there is life-changing!',
          timestamp: new Date('2024-01-14T18:50:00'),
        },
      ],
      bookmarks: ['4', '18'],
    },
  },
  {
    id: '6',
    restaurant: mockRestaurants.find((r) => r.id === '12')!, // Eleven Madison Park
    user: mockUsers.find((u) => u.id === '1')!, // Tor Cox
    rating: 0,
    comment:
      "Finally got a reservation! The plant-based tasting menu sounds incredible. Can't wait! 🌱✨",
    photos: [],
    tags: ['Want to Try', 'Plant-Based', 'Tasting Menu'],
    timestamp: new Date('2024-01-14T16:20:00'),
    type: 'want_to_try',
    interactions: {
      likes: ['2', '4', '8', '17'],
      comments: [
        {
          id: 'c8',
          userId: '2',
          content: "You're going to love it! The innovation is incredible",
          timestamp: new Date('2024-01-14T16:35:00'),
        },
        {
          id: 'c9',
          userId: '4',
          content: 'So jealous! Been trying to get a table for months',
          timestamp: new Date('2024-01-14T16:40:00'),
        },
      ],
      bookmarks: ['2', '4'],
    },
  },
  {
    id: '7',
    restaurant: mockRestaurants.find((r) => r.id === '23')!, // Taverna Kyclades
    user: mockUsers.find((u) => u.id === '15')!, // Nina Kowalski
    rating: 8.7,
    comment: 'Worth the trip to Astoria! The grilled octopus was perfect - tender and charred 🐙',
    photos: ['https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400'],
    tags: ['Greek', 'Octopus', 'Worth the Trip'],
    timestamp: new Date('2024-01-14T15:10:00'),
    type: 'visit',
    interactions: {
      likes: ['19', '12', '6'],
      comments: [
        {
          id: 'c10',
          userId: '19',
          content: 'This place reminds me of home in Greece! 🇬🇷',
          timestamp: new Date('2024-01-14T15:25:00'),
        },
      ],
      bookmarks: ['19'],
    },
  },
  {
    id: '8',
    restaurant: mockRestaurants.find((r) => r.id === '24')!, // Ivan Ramen
    user: mockUsers.find((u) => u.id === '11')!, // Ryan Tanaka
    rating: 8.8,
    comment: 'Finally, authentic ramen in NYC! The triple pork has incredible depth 🍜🙌',
    photos: ['https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400'],
    tags: ['Authentic', 'Ramen', 'Triple Pork'],
    timestamp: new Date('2024-01-13T20:00:00'),
    type: 'visit',
    interactions: {
      likes: ['3', '16', '7'],
      comments: [
        {
          id: 'c11',
          userId: '3',
          content: 'Adding this to my list! Always looking for good ramen',
          timestamp: new Date('2024-01-13T20:15:00'),
        },
      ],
      bookmarks: ['3'],
    },
  },
  {
    id: '9',
    restaurant: mockRestaurants.find((r) => r.id === '14')!, // Locanda Verde
    user: mockUsers.find((u) => u.id === '6')!, // Lucia Rossi
    rating: 8.7,
    comment: "Nonna would approve! The sheep's milk ricotta transported me back to Tuscany 🇮🇹",
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'],
    tags: ['Authentic Italian', 'Ricotta', 'Tuscany'],
    timestamp: new Date('2024-01-13T19:30:00'),
    type: 'visit',
    interactions: {
      likes: ['1', '14', '22'],
      comments: [],
      bookmarks: ['1'],
    },
  },
  {
    id: '10',
    restaurant: mockRestaurants.find((r) => r.id === '1')!, // Balthazar
    user: mockUsers.find((u) => u.id === '13')!, // Jamie Foster
    rating: 8.6,
    comment: 'Perfect brunch spot! The French toast was decadent and mimosas were strong 🥞🥂',
    photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'],
    tags: ['Brunch', 'French Toast', 'Mimosas'],
    timestamp: new Date('2024-01-13T12:45:00'),
    type: 'visit',
    interactions: {
      likes: ['1', '2', '8', '10'],
      comments: [
        {
          id: 'c12',
          userId: '1',
          content: 'Their brunch is amazing! Love the atmosphere',
          timestamp: new Date('2024-01-13T13:00:00'),
        },
      ],
      bookmarks: ['13'],
    },
  },
  {
    id: '11',
    restaurant: mockRestaurants.find((r) => r.id === '20')!, // L'industrie Pizzeria
    user: mockUsers.find((u) => u.id === '1')!, // Tor Cox
    rating: 0,
    comment: "Need to try that Instagram famous burrata slice everyone's talking about! 📸🍕",
    photos: [],
    tags: ['Want to Try', 'Instagram Famous', 'Burrata'],
    timestamp: new Date('2024-01-13T10:20:00'),
    type: 'want_to_try',
    interactions: {
      likes: ['5', '20'],
      comments: [
        {
          id: 'c13',
          userId: '5',
          content: "It's actually as good as it looks! Square slices are the way to go",
          timestamp: new Date('2024-01-13T10:35:00'),
        },
      ],
      bookmarks: ['5'],
    },
  },
  {
    id: '12',
    restaurant: mockRestaurants.find((r) => r.id === '4')!, // Minetta Tavern
    user: mockUsers.find((u) => u.id === '18')!, // Marcus Williams
    rating: 9.0,
    comment: 'The Black Label Burger is the best burger in NYC. Period. 🍔👑',
    photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'],
    tags: ['Best Burger', 'Black Label', 'NYC'],
    timestamp: new Date('2024-01-12T21:15:00'),
    type: 'visit',
    interactions: {
      likes: ['9', '13', '20'],
      comments: [
        {
          id: 'c14',
          userId: '9',
          content: 'Agreed! That dry-aged beef blend is incredible',
          timestamp: new Date('2024-01-12T21:30:00'),
        },
      ],
      bookmarks: ['13'],
    },
  },
  {
    id: '13',
    restaurant: mockRestaurants.find((r) => r.id === '5')!, // Katz's Delicatessen
    user: mockUsers.find((u) => u.id === '7')!, // David Park
    rating: 8.1,
    comment: 'Tourist trap but the pastrami sandwich is actually worth it! Cash only though 💰',
    photos: ['https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400'],
    tags: ['Pastrami', 'Tourist', 'Cash Only'],
    timestamp: new Date('2024-01-12T14:00:00'),
    type: 'visit',
    interactions: {
      likes: ['1', '9', '14'],
      comments: [],
      bookmarks: [],
    },
  },
  {
    id: '14',
    restaurant: mockRestaurants.find((r) => r.id === '15')!, // Daniel
    user: mockUsers.find((u) => u.id === '10')!, // Maya Patel
    rating: 9.4,
    comment:
      'The chocolate soufflé was worth the 20-minute wait! Light as air but intensely chocolatey 🍫☁️',
    photos: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'],
    tags: ['Dessert', 'Chocolate Soufflé', 'Worth the Wait'],
    timestamp: new Date('2024-01-12T11:30:00'),
    type: 'visit',
    interactions: {
      likes: ['4', '8', '13', '16'],
      comments: [
        {
          id: 'c15',
          userId: '13',
          content: 'Their desserts are always incredible! Love the pastry team there',
          timestamp: new Date('2024-01-12T11:45:00'),
        },
      ],
      bookmarks: ['13'],
    },
  },
  {
    id: '15',
    restaurant: mockRestaurants.find((r) => r.id === '11')!, // Halal Guys
    user: mockUsers.find((u) => u.id === '7')!, // David Park
    rating: 7.8,
    comment: 'Perfect late night food! The white sauce is addictive and portions are huge 🌙',
    photos: ['https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400'],
    tags: ['Late Night', 'White Sauce', 'Large Portions'],
    timestamp: new Date('2024-01-11T23:45:00'),
    type: 'visit',
    interactions: {
      likes: ['3', '16', '20'],
      comments: [],
      bookmarks: [],
    },
  },
];

// Trending restaurants based on recent activity
export const trendingRestaurants = [
  mockRestaurants.find((r) => r.id === '2')!, // Prince Street Pizza
  mockRestaurants.find((r) => r.id === '27')!, // Blue Hill
  mockRestaurants.find((r) => r.id === '20')!, // L'industrie Pizzeria
  mockRestaurants.find((r) => r.id === '24')!, // Ivan Ramen
  mockRestaurants.find((r) => r.id === '4')!, // Minetta Tavern
];

// Recent check-ins for quick access
export const recentCheckIns = mockActivities
  .filter((activity) => activity.type === 'visit')
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  .slice(0, 10);
