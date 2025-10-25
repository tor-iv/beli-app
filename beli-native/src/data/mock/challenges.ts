import { Restaurant } from '../../types';

export interface ChallengeActivity {
  id: string;
  restaurantId: string;
  rating: number;
  notes?: string;
  photos?: string[];
  timestamp: Date;
}

export interface Challenge2025 {
  goalCount: number;
  currentCount: number;
  startDate: Date;
  endDate: Date;
  activities: ChallengeActivity[];
}

// Mock challenge activities - grouped by date
export const mockChallengeActivities: ChallengeActivity[] = [
  // October 2025
  {
    id: 'act-1',
    restaurantId: 'rest-cafe-habana',
    rating: 6.1,
    notes: 'Needs salt 🧂 I\'m salty.',
    photos: [],
    timestamp: new Date('2025-10-20T19:30:00'),
  },
  {
    id: 'act-2',
    restaurantId: 'rest-tacos-1986',
    rating: 6.5,
    notes: 'Fine tacos',
    photos: [],
    timestamp: new Date('2025-10-20T18:15:00'),
  },
  {
    id: 'act-3',
    restaurantId: 'rest-olle',
    rating: 9.1,
    notes: '',
    photos: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    ],
    timestamp: new Date('2025-10-20T20:45:00'),
  },
  {
    id: 'act-4',
    restaurantId: 'rest-le-bernardin',
    rating: 9.5,
    notes: 'Absolutely incredible seafood. Best meal of the year.',
    photos: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop',
    ],
    timestamp: new Date('2025-10-18T19:00:00'),
  },
  {
    id: 'act-5',
    restaurantId: 'rest-carbone',
    rating: 8.8,
    notes: 'Classic Italian-American done perfectly.',
    photos: [],
    timestamp: new Date('2025-10-15T20:30:00'),
  },
  // September 2025
  {
    id: 'act-6',
    restaurantId: 'rest-peter-luger',
    rating: 9.2,
    notes: 'The porterhouse is legendary for a reason.',
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
    ],
    timestamp: new Date('2025-09-28T19:45:00'),
  },
  {
    id: 'act-7',
    restaurantId: 'rest-katz',
    rating: 8.5,
    notes: 'Best pastrami sandwich in NYC, hands down.',
    photos: [],
    timestamp: new Date('2025-09-22T12:30:00'),
  },
  {
    id: 'act-8',
    restaurantId: 'rest-gramercy-tavern',
    rating: 8.9,
    notes: 'Seasonal menu was outstanding.',
    photos: [],
    timestamp: new Date('2025-09-15T18:00:00'),
  },
  // August 2025
  {
    id: 'act-9',
    restaurantId: 'rest-eleven-madison',
    rating: 9.7,
    notes: 'Fine dining at its absolute best. Worth every penny.',
    photos: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
    ],
    timestamp: new Date('2025-08-25T19:30:00'),
  },
  {
    id: 'act-10',
    restaurantId: 'rest-momofuku-ko',
    rating: 8.7,
    notes: 'Innovative and delicious. Counter seating was fun.',
    photos: [],
    timestamp: new Date('2025-08-12T20:00:00'),
  },
];

// Main challenge data
export const challenge2025: Challenge2025 = {
  goalCount: 250,
  currentCount: 352, // Over the goal!
  startDate: new Date('2025-01-01T00:00:00'),
  endDate: new Date('2025-12-31T23:59:59'),
  activities: mockChallengeActivities,
};

// Helper function to get days remaining
export const getDaysRemaining = (): number => {
  const now = new Date();
  const end = challenge2025.endDate;
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Helper function to get activities by month
export const getActivitiesByMonth = (): Map<string, ChallengeActivity[]> => {
  const grouped = new Map<string, ChallengeActivity[]>();

  mockChallengeActivities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(activity);
  });

  // Sort activities within each month by date (newest first)
  grouped.forEach((activities, month) => {
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  return grouped;
};

// Helper function to get progress percentage
export const getProgressPercentage = (): number => {
  return Math.round((challenge2025.currentCount / challenge2025.goalCount) * 100);
};
