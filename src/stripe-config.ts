export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: number;
  gameSlug?: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RetqOGBpnJxoCN03BPLXYnO',
    name: 'Premium Gaming Subscription',
    description: 'Access to all premium games and features',
    mode: 'subscription',
    price: 9.99,
  },
  {
    priceId: 'price_1RetqOGBpnJxoCN03BPLXYnO',
    name: 'Monthly Premium Plan',
    description: 'Monthly subscription for premium gaming access',
    mode: 'subscription',
    price: 9.99,
  },
  // Individual game products - these need to be created in your Stripe dashboard
  // For now, using the same price ID as subscription (you'll need to replace these)
  {
    priceId: 'price_1RetqOGBpnJxoCN03BPLXYnO', // Replace with actual price ID for RPG game
    name: 'Pixel Adventure',
    description: 'A simple RPG adventure game',
    mode: 'payment',
    price: 4.99,
    gameSlug: 'rpg',
  },
  {
    priceId: 'price_1RetqOGBpnJxoCN03BPLXYnO', // Replace with actual price ID for Everest game
    name: 'Everest Climb',
    description: 'Climb Mount Everest!',
    mode: 'payment',
    price: 7.99,
    gameSlug: 'everest',
  },
  {
    priceId: 'price_1RetqOGBpnJxoCN03BPLXYnO', // Replace with actual price ID for Kathmandu game
    name: 'Kathmandu Maze',
    description: 'Navigate through ancient Kathmandu streets',
    mode: 'payment',
    price: 5.99,
    gameSlug: 'kathmandu',
  },
  {
    priceId: 'price_1RetqOGBpnJxoCN03BPLXYnO', // Replace with actual price ID for Temple game
    name: 'Nepali Temple Puzzle',
    description: 'Solve ancient puzzles in Nepali temples',
    mode: 'payment',
    price: 6.99,
    gameSlug: 'temple',
  },
];