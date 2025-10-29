export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
}

export const faqData: FAQ[] = [
  // Getting Started
  {
    id: 'gs1',
    category: 'Getting Started',
    question: 'What is Beli?',
    answer: 'Beli is a social restaurant discovery platform that helps you find amazing places to eat based on recommendations from friends and food experts. Track the restaurants you\'ve been to, discover new spots, and connect with fellow food lovers.',
  },
  {
    id: 'gs2',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Download the Beli app and tap "Sign Up" on the welcome screen. You can create an account using your email, phone number, or by connecting your social media accounts. Fill in your profile information and start discovering great restaurants!',
  },
  {
    id: 'gs3',
    category: 'Getting Started',
    question: 'How do I add restaurants to my lists?',
    answer: 'Search for a restaurant, then tap on it to view details. You\'ll see three list options: "Been" (places you\'ve visited), "Want to Try" (places on your wishlist), and "Recommend" (places you suggest to friends). Tap any option to add the restaurant to that list.',
  },
  {
    id: 'gs4',
    category: 'Getting Started',
    question: 'How do I find restaurants near me?',
    answer: 'Go to the Search tab and enable location services when prompted. The app will show restaurants near your current location. You can also search by neighborhood, cuisine type, or specific restaurant names.',
  },

  // Rankings & Reviews
  {
    id: 'rr1',
    category: 'Rankings & Reviews',
    question: 'How does the rating system work?',
    answer: 'Beli uses a 10-point rating scale. Ratings of 8.0+ are excellent (green), 7.0-7.9 are good (light green), 5.0-6.9 are average (orange), and below 5.0 needs improvement (red). Your ratings help friends discover great spots and contribute to the community.',
  },
  {
    id: 'rr2',
    category: 'Rankings & Reviews',
    question: 'Can I edit or delete my reviews?',
    answer: 'Yes! Go to your profile, find the review you want to change, tap the three dots menu, and select "Edit" or "Delete". You can update your rating, notes, photos, and other details at any time.',
  },
  {
    id: 'rr3',
    category: 'Rankings & Reviews',
    question: 'What\'s the difference between Been and Want to Try?',
    answer: '"Been" is for restaurants you\'ve actually visited and can rate. "Want to Try" is your wishlist of places you\'re interested in trying. Once you visit a place from "Want to Try", you can move it to "Been" and add your rating.',
  },
  {
    id: 'rr4',
    category: 'Rankings & Reviews',
    question: 'How is my match score calculated?',
    answer: 'Match scores show how similar your taste is to another user. It\'s calculated by comparing restaurants you\'ve both rated and how closely your ratings align. A higher match score means you have similar food preferences!',
  },

  // Social Features
  {
    id: 'sf1',
    category: 'Social Features',
    question: 'How do I follow friends on Beli?',
    answer: 'Go to the Search tab and tap the "Users" filter. Search for your friends by name or username. When you find them, tap their profile and hit the "Follow" button. You can also sync your contacts to find friends who are already on Beli.',
  },
  {
    id: 'sf2',
    category: 'Social Features',
    question: 'What is Beli Supper Club?',
    answer: 'Beli Supper Club (SC) is our premium membership that gives you priority access to shared reservations, exclusive restaurant events, and special perks at partner restaurants. SC members also get an exclusive badge on their profile.',
  },
  {
    id: 'sf3',
    category: 'Social Features',
    question: 'How do invites work?',
    answer: 'When you join Beli, you get a limited number of invites to share with friends. Inviting friends helps build a community of trusted restaurant recommendations. You can earn more invites by being an active member - rating restaurants, writing helpful reviews, and engaging with the community.',
  },
  {
    id: 'sf4',
    category: 'Social Features',
    question: 'What are streaks?',
    answer: 'Streaks track how many consecutive weeks you\'ve tried a new restaurant. Visit and rate at least one new place each week to keep your streak alive! The longer your streak, the higher you\'ll rank on the leaderboard.',
  },

  // Reservations
  {
    id: 'res1',
    category: 'Reservations',
    question: 'How does reservation sharing work?',
    answer: 'When you can\'t use a reservation, you can share it with the Beli community instead of canceling. Other users can claim your reservation and the restaurant stays full. It\'s a win-win for everyone!',
  },
  {
    id: 'res2',
    category: 'Reservations',
    question: 'What is priority level?',
    answer: 'Priority level determines your access to claimed shared reservations. It increases based on your activity on Beli - rating restaurants, maintaining streaks, and being an engaged community member. Beli Supper Club members get elevated priority.',
  },
  {
    id: 'res3',
    category: 'Reservations',
    question: 'How do I claim a shared reservation?',
    answer: 'Browse available reservations in the app, find one that works for you, and tap "Claim". If multiple people want the same reservation, priority level determines who gets it. You\'ll receive a confirmation with all the reservation details.',
  },
  {
    id: 'res4',
    category: 'Reservations',
    question: 'Can I cancel a claimed reservation?',
    answer: 'Yes, but please only claim reservations you\'ll actually use. If you need to cancel, release it back to the community as early as possible so someone else can claim it. Repeatedly claiming and canceling may affect your priority level.',
  },

  // Account & Privacy
  {
    id: 'ap1',
    category: 'Account & Privacy',
    question: 'How do I change my account settings?',
    answer: 'Open the menu (three lines in top right) and tap "Settings". From there you can update your email, phone number, password, notification preferences, privacy settings, and more.',
  },
  {
    id: 'ap2',
    category: 'Account & Privacy',
    question: 'How do I make my account private?',
    answer: 'Go to Settings → Privacy → toggle "Public Account" off. When your account is private, only approved followers can see your lists, ratings, and activity. You\'ll need to approve follow requests manually.',
  },
  {
    id: 'ap3',
    category: 'Account & Privacy',
    question: 'How do I block or mute other users?',
    answer: 'To block someone, go to their profile, tap the three dots menu, and select "Block User". Blocked users can\'t see your profile or interact with you. To mute someone, use the same menu and select "Mute" - you\'ll stop seeing their activity in your feed but they can still see your public content.',
  },
  {
    id: 'ap4',
    category: 'Account & Privacy',
    question: 'How do I delete my account?',
    answer: 'Go to Settings → Your Account → scroll to the bottom and tap "Delete my account". This action is permanent and cannot be undone. All your data including ratings, reviews, and lists will be permanently deleted.',
  },
]

export const faqCategories = [
  'Getting Started',
  'Rankings & Reviews',
  'Social Features',
  'Reservations',
  'Account & Privacy',
]

export function getFAQsByCategory(category: string): FAQ[] {
  return faqData.filter((faq) => faq.category === category)
}

export function searchFAQs(query: string): FAQ[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return faqData

  return faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
  )
}
