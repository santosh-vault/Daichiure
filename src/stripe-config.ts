export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: number;
  gameSlug?: string;
}

// You'll need to replace these price IDs with your actual Stripe price IDs
// Create these products in your Stripe dashboard first
export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1QdqOGBpnJxoCN03BPLXYnO', // Replace with your actual subscription price ID
    name: 'Premium Gaming Subscription',
    description: 'Access to all premium games and features',
    mode: 'subscription',
    price: 9.99,
  },
  // Individual game products - create these in your Stripe dashboard
  {
    priceId: 'price_1QdqOGBpnJxoCN03BPLXYnP', // Replace with actual price ID for RPG game
    name: 'Pixel Adventure',
    description: 'A simple RPG adventure game',
    mode: 'payment',
    price: 4.99,
    gameSlug: 'rpg',
  },
  {
    priceId: 'price_1QdqOGBpnJxoCN03BPLXYnQ', // Replace with actual price ID for Everest game
    name: 'Everest Climb',
    description: 'Climb Mount Everest!',
    mode: 'payment',
    price: 7.99,
    gameSlug: 'everest',
  },
  {
    priceId: 'price_1QdqOGBpnJxoCN03BPLXYnR', // Replace with actual price ID for Kathmandu game
    name: 'Kathmandu Maze',
    description: 'Navigate through ancient Kathmandu streets',
    mode: 'payment',
    price: 5.99,
    gameSlug: 'kathmandu',
  },
  {
    priceId: 'price_1QdqOGBpnJxoCN03BPLXYnS', // Replace with actual price ID for Temple game
    name: 'Nepali Temple Puzzle',
    description: 'Solve ancient puzzles in Nepali temples',
    mode: 'payment',
    price: 6.99,
    gameSlug: 'temple',
  },
];