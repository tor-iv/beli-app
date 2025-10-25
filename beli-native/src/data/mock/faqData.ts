export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const faqCategories = [
  'Getting Started',
  'Rankings & Reviews',
  'Social Features',
  'Reservations',
  'Account & Privacy',
];

export const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'faq-1',
    category: 'Getting Started',
    question: 'What is Beli?',
    answer: 'Beli is a social restaurant discovery and rating app that helps you find great places to eat based on your taste profile and recommendations from friends. Unlike traditional review sites, Beli uses a 10-point rating scale and matches you with restaurants based on your preferences.',
  },
  {
    id: 'faq-2',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'You can create an account by downloading the Beli app and signing up with your email address or phone number. After verification, you\'ll be able to customize your profile, add your dietary restrictions, and start discovering restaurants.',
  },
  {
    id: 'faq-3',
    category: 'Getting Started',
    question: 'How do I add restaurants to my lists?',
    answer: 'Tap the "+" button on any restaurant page to add it to your lists. You can mark restaurants as "Been," "Want to Try," or add them to custom lists you\'ve created. You can also rate and review restaurants you\'ve visited.',
  },
  {
    id: 'faq-4',
    category: 'Getting Started',
    question: 'How do I find restaurants near me?',
    answer: 'Use the Search tab to explore restaurants in your area. You can filter by cuisine type, price range, neighborhood, and distance. Your home city can be changed in Settings to see recommendations for different locations.',
  },

  // Rankings & Reviews
  {
    id: 'faq-5',
    category: 'Rankings & Reviews',
    question: 'How does the rating system work?',
    answer: 'Beli uses a 10-point rating scale where 8.0+ is excellent, 7.0-7.9 is good, 5.0-6.9 is average, and below 5.0 needs improvement. Your ratings are personal and help create your unique taste profile that powers recommendations.',
  },
  {
    id: 'faq-6',
    category: 'Rankings & Reviews',
    question: 'Can I edit or delete my reviews?',
    answer: 'Yes! Navigate to your profile, find the review you want to edit, tap the three dots, and select "Edit" or "Delete." Your ratings and notes can be updated at any time.',
  },
  {
    id: 'faq-7',
    category: 'Rankings & Reviews',
    question: 'What\'s the difference between Been and Want to Try?',
    answer: '"Been" is for restaurants you\'ve visited and can rate. "Want to Try" is your wishlist for restaurants you want to visit in the future. You can also see which restaurants your friends want to try to plan group outings.',
  },
  {
    id: 'faq-8',
    category: 'Rankings & Reviews',
    question: 'How is my match score calculated?',
    answer: 'Your match score is calculated based on your taste profile, including your ratings, dietary restrictions, disliked cuisines, and preferences of users with similar tastes. The algorithm learns from your ratings to improve recommendations over time.',
  },

  // Social Features
  {
    id: 'faq-9',
    category: 'Social Features',
    question: 'How do I follow friends on Beli?',
    answer: 'Search for friends by name or username in the Search tab, then tap "Follow" on their profile. You can also invite friends via text, email, or by sharing your referral link from the Settings menu.',
  },
  {
    id: 'faq-10',
    category: 'Social Features',
    question: 'What is Beli Supper Club?',
    answer: 'Beli Supper Club (SC) is our premium membership tier that offers exclusive benefits including higher reservation priority, special event access, and the ability to nominate friends to join. Members are identified by the SC badge.',
  },
  {
    id: 'faq-11',
    category: 'Social Features',
    question: 'How do invites work?',
    answer: 'Each user receives a limited number of invites to share with friends. You can view your remaining invites in the Settings menu. When someone joins using your invite link, they\'ll be added to your network and you may receive additional invites.',
  },
  {
    id: 'faq-12',
    category: 'Social Features',
    question: 'What are streaks?',
    answer: 'Streaks track how many consecutive weeks you\'ve tried a new restaurant. Maintain your streak by visiting at least one new place each week. Streaks appear on your profile and in notifications when you hit milestones.',
  },

  // Reservations
  {
    id: 'faq-13',
    category: 'Reservations',
    question: 'How does reservation sharing work?',
    answer: 'If you have a reservation you can\'t use, you can share it with the Beli community. Other users can claim available reservations. Sharing reservations and successfully inviting friends increases your priority level for future reservations.',
  },
  {
    id: 'faq-14',
    category: 'Reservations',
    question: 'What is priority level?',
    answer: 'Priority level determines your access to shared reservations and exclusive dining opportunities. Your level increases when you share reservations, invite friends who join, and actively participate in the community. SC members start at an elevated priority level.',
  },
  {
    id: 'faq-15',
    category: 'Reservations',
    question: 'How do I claim a shared reservation?',
    answer: 'Navigate to the Reservations tab, browse available reservations, and tap "Claim" on any you\'d like. You must have notifications enabled for shared reservations to claim them. Once claimed, you\'ll receive the reservation details.',
  },
  {
    id: 'faq-16',
    category: 'Reservations',
    question: 'Can I cancel a claimed reservation?',
    answer: 'Yes, but please do so as soon as possible. Go to your Claimed Reservations, select the reservation, and tap "Release back to community" so someone else can claim it. Repeatedly claiming and canceling may affect your priority level.',
  },

  // Account & Privacy
  {
    id: 'faq-17',
    category: 'Account & Privacy',
    question: 'How do I change my account settings?',
    answer: 'Tap the Profile tab, then the menu icon (three lines) in the top right corner, and select "Settings." From there you can manage your account, notifications, app preferences, and privacy settings.',
  },
  {
    id: 'faq-18',
    category: 'Account & Privacy',
    question: 'How do I make my account private?',
    answer: 'Go to Settings > Privacy Settings and toggle "Public Account" off. When private, only approved followers can see your lists, ratings, and activity. You can approve or deny follow requests from your notifications.',
  },
  {
    id: 'faq-19',
    category: 'Account & Privacy',
    question: 'How do I block or mute other users?',
    answer: 'Visit the user\'s profile, tap the three dots in the top right, and select "Block" or "Mute." Blocked users cannot see your profile or interact with you. Muted users stay in your network but you won\'t see their activity in your feed.',
  },
  {
    id: 'faq-20',
    category: 'Account & Privacy',
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Account Settings > Delete my account. This action is permanent and will delete all your data including ratings, reviews, lists, and social connections. If you\'re sure, follow the confirmation prompts to proceed.',
  },
];

// Helper function to get FAQs by category
export const getFAQsByCategory = (category: string): FAQItem[] => {
  return faqData.filter(faq => faq.category === category);
};

// Helper function to search FAQs
export const searchFAQs = (query: string): FAQItem[] => {
  const lowerQuery = query.toLowerCase();
  return faqData.filter(
    faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
  );
};
