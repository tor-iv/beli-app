
import { mockRestaurants } from './restaurants';
import { mockUsers, currentUser } from './users';

import type { Reservation, ReservationPriorityLevel } from '@/types';

// Helper function to get future dates
const getFutureDate = (daysFromNow: number, hour: number, minute: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const getPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const mockReservations: Reservation[] = [
  // Available reservations (shared by others, ready to claim)
  {
    id: 'res-1',
    restaurantId: '1',
    restaurant: mockRestaurants[0],
    userId: mockUsers[1].id,
    user: mockUsers[1],
    dateTime: getFutureDate(2, 20, 45), // Sat, 2 days from now, 8:45 PM
    partySize: 4,
    status: 'available',
    createdAt: getPastDate(3),
    notes: 'Great for date night!',
  },
  {
    id: 'res-2',
    restaurantId: '2',
    restaurant: mockRestaurants[1],
    userId: mockUsers[2].id,
    user: mockUsers[2],
    dateTime: getFutureDate(3, 13, 30), // Sun, 3 days from now, 1:30 PM
    partySize: 4,
    status: 'available',
    createdAt: getPastDate(5),
  },
  {
    id: 'res-3',
    restaurantId: '3',
    restaurant: mockRestaurants[2],
    userId: mockUsers[3].id,
    user: mockUsers[3],
    dateTime: getFutureDate(3, 18, 15), // Sun, 3 days from now, 6:15 PM
    partySize: 5,
    status: 'available',
    createdAt: getPastDate(2),
    notes: 'Get the soup dumplings!',
  },
  {
    id: 'res-4',
    restaurantId: '4',
    restaurant: mockRestaurants[3],
    userId: mockUsers[4].id,
    user: mockUsers[4],
    dateTime: getFutureDate(3, 21, 0), // Sun, 3 days from now, 9:00 PM
    partySize: 4,
    status: 'available',
    createdAt: getPastDate(1),
  },
  {
    id: 'res-5',
    restaurantId: '5',
    restaurant: mockRestaurants[4],
    userId: mockUsers[1].id,
    user: mockUsers[1],
    dateTime: getFutureDate(6, 17, 45), // Wed, 6 days from now, 5:45 PM
    partySize: 4,
    status: 'available',
    createdAt: getPastDate(7),
    notes: 'Perfect for special occasions',
  },
  {
    id: 'res-6',
    restaurantId: '6',
    restaurant: mockRestaurants[5],
    userId: mockUsers[5].id,
    user: mockUsers[5],
    dateTime: getFutureDate(7, 19, 30), // One week from now, 7:30 PM
    partySize: 2,
    status: 'available',
    createdAt: getPastDate(4),
  },
  {
    id: 'res-7',
    restaurantId: '7',
    restaurant: mockRestaurants[6],
    userId: mockUsers[2].id,
    user: mockUsers[2],
    dateTime: getFutureDate(10, 18, 0), // 10 days from now, 6:00 PM
    partySize: 2,
    status: 'available',
    createdAt: getPastDate(12),
  },
  {
    id: 'res-8',
    restaurantId: '8',
    restaurant: mockRestaurants[7],
    userId: mockUsers[6].id,
    user: mockUsers[6],
    dateTime: getFutureDate(1, 12, 30), // Tomorrow, 12:30 PM
    partySize: 3,
    status: 'available',
    createdAt: getPastDate(2),
  },
  {
    id: 'res-9',
    restaurantId: '9',
    restaurant: mockRestaurants[8],
    userId: mockUsers[3].id,
    user: mockUsers[3],
    dateTime: getFutureDate(5, 19, 15), // 5 days from now, 7:15 PM
    partySize: 4,
    status: 'available',
    createdAt: getPastDate(6),
  },
  {
    id: 'res-10',
    restaurantId: '10',
    restaurant: mockRestaurants[9],
    userId: mockUsers[4].id,
    user: mockUsers[4],
    dateTime: getFutureDate(8, 20, 0), // 8 days from now, 8:00 PM
    partySize: 2,
    status: 'available',
    createdAt: getPastDate(10),
    notes: 'Tasting menu highly recommended',
  },

  // Claimed reservations (current user has claimed)
  {
    id: 'res-11',
    restaurantId: '11',
    restaurant: mockRestaurants[10],
    userId: mockUsers[2].id,
    user: mockUsers[2],
    dateTime: getFutureDate(4, 19, 30), // 4 days from now, 7:30 PM
    partySize: 4,
    status: 'claimed',
    claimedBy: currentUser.id,
    createdAt: getPastDate(8),
  },
  {
    id: 'res-12',
    restaurantId: '12',
    restaurant: mockRestaurants[11],
    userId: mockUsers[1].id,
    user: mockUsers[1],
    dateTime: getFutureDate(9, 18, 45), // 9 days from now, 6:45 PM
    partySize: 2,
    status: 'claimed',
    claimedBy: currentUser.id,
    createdAt: getPastDate(11),
  },

  // Shared reservations (current user has shared with others)
  {
    id: 'res-13',
    restaurantId: '13',
    restaurant: mockRestaurants[12],
    userId: currentUser.id,
    user: currentUser,
    dateTime: getFutureDate(5, 20, 15), // 5 days from now, 8:15 PM
    partySize: 6,
    status: 'shared',
    sharedWith: [mockUsers[1].id, mockUsers[2].id, mockUsers[3].id],
    createdAt: getPastDate(7),
    notes: 'Group dinner',
  },
  {
    id: 'res-14',
    restaurantId: '14',
    restaurant: mockRestaurants[13],
    userId: currentUser.id,
    user: currentUser,
    dateTime: getFutureDate(12, 19, 0), // 12 days from now, 7:00 PM
    partySize: 4,
    status: 'shared',
    sharedWith: [mockUsers[4].id, mockUsers[5].id],
    createdAt: getPastDate(5),
  },

  // Reminders (upcoming reservations user cares about)
  {
    id: 'res-15',
    restaurantId: '15',
    restaurant: mockRestaurants[14],
    userId: currentUser.id,
    user: currentUser,
    dateTime: getFutureDate(1, 19, 30), // Tomorrow, 7:30 PM
    partySize: 2,
    status: 'claimed',
    claimedBy: currentUser.id,
    createdAt: getPastDate(14),
    notes: 'Anniversary dinner!',
  },
];

// Priority levels for users
export const mockPriorityLevels: ReservationPriorityLevel[] = [
  {
    userId: currentUser.id,
    level: 'SC',
    invitesSent: 15,
    reservationsShared: 8,
    nextLevelProgress: 100, // Already at max level
    nextLevel: undefined,
  },
  {
    userId: mockUsers[1].id,
    level: 'Gold',
    invitesSent: 12,
    reservationsShared: 6,
    nextLevelProgress: 75,
    nextLevel: 'SC',
  },
  {
    userId: mockUsers[2].id,
    level: 'Silver',
    invitesSent: 7,
    reservationsShared: 3,
    nextLevelProgress: 60,
    nextLevel: 'Gold',
  },
  {
    userId: mockUsers[3].id,
    level: 'Bronze',
    invitesSent: 3,
    reservationsShared: 1,
    nextLevelProgress: 30,
    nextLevel: 'Silver',
  },
];

// Helper function to get user's priority level
export const getUserPriorityLevel = (userId: string): ReservationPriorityLevel => {
  return (
    mockPriorityLevels.find((p) => p.userId === userId) || {
      userId,
      level: 'Bronze',
      invitesSent: 0,
      reservationsShared: 0,
      nextLevelProgress: 0,
      nextLevel: 'Silver',
    }
  );
};

// Helper functions to filter reservations
export const getAvailableReservations = (): Reservation[] => {
  return mockReservations.filter((r) => r.status === 'available');
};

export const getClaimedReservationsByUser = (userId: string): Reservation[] => {
  return mockReservations.filter((r) => r.status === 'claimed' && r.claimedBy === userId);
};

export const getSharedReservationsByUser = (userId: string): Reservation[] => {
  return mockReservations.filter((r) => r.status === 'shared' && r.userId === userId);
};

export const getReservationReminders = (userId: string): Reservation[] => {
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  return mockReservations.filter(
    (r) =>
      (r.userId === userId || r.claimedBy === userId) &&
      r.dateTime >= now &&
      r.dateTime <= threeDaysFromNow &&
      r.status !== 'cancelled'
  );
};
