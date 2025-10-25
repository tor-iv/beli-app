export interface RecentSearch {
  id: string;
  restaurantId: string;
  restaurantName: string;
  location: string;
  timestamp: Date;
}

export const mockRecentSearches: RecentSearch[] = [
  {
    id: 'recent-1',
    restaurantId: '8',
    restaurantName: "375° Chicken 'n Fries",
    location: 'Lower East Side, Manhattan',
    timestamp: new Date('2025-10-23T15:30:00'),
  },
  {
    id: 'recent-2',
    restaurantId: '9',
    restaurantName: 'Patacon Pisao',
    location: 'Lower East Side, Manhattan',
    timestamp: new Date('2025-10-22T19:45:00'),
  },
  {
    id: 'recent-3',
    restaurantId: '13',
    restaurantName: 'Carnitas Ramirez',
    location: 'Alphabet City, Manhattan',
    timestamp: new Date('2025-10-21T12:15:00'),
  },
  {
    id: 'recent-4',
    restaurantId: '16',
    restaurantName: "Rolo's",
    location: 'Ridgewood, Queens',
    timestamp: new Date('2025-10-20T18:00:00'),
  },
  {
    id: 'recent-5',
    restaurantId: '25',
    restaurantName: 'Café Carmellini',
    location: 'NoMad, Manhattan',
    timestamp: new Date('2025-10-19T10:30:00'),
  },
];
