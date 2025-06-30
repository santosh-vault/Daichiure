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
    priceId: 'price_1RfNtK4PJ3ItcT3GVGbszsfV',
    name: 'Pixel Adventure',
    description: 'A simple RPG adventure game. Explore the world, collect items, and battle monsters.',
    mode: 'payment',
    price: 4.99,
    gameSlug: 'rpg',
  },
  {
    priceId: 'price_everest_climb_test',
    name: 'Everest Climb',
    description: 'Climb Mount Everest! Navigate through treacherous terrain and reach the summit.',
    mode: 'payment',
    price: 7.99,
    gameSlug: 'everest',
  },
  {
    priceId: 'price_kathmandu_maze_test',
    name: 'Kathmandu Maze',
    description: 'Navigate through the ancient streets of Kathmandu in this cultural maze adventure.',
    mode: 'payment',
    price: 5.99,
    gameSlug: 'kathmandu',
  },
  {
    priceId: 'price_temple_puzzle_test',
    name: 'Nepali Temple Puzzle',
    description: 'Solve ancient puzzles in beautiful Nepali temples and discover hidden treasures.',
    mode: 'payment',
    price: 6.99,
    gameSlug: 'temple',
  },
  // Premium subscription option
  {
    priceId: 'price_premium_subscription_test',
    name: 'Premium Gaming Subscription',
    description: 'Access all premium games with unlimited play time.',
    mode: 'subscription',
    price: 9.99,
  },
];