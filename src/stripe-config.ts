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
    description: 'Pixel Adventure',
    mode: 'payment',
    price: 1.00,
    gameSlug: 'rpg',
  },
];