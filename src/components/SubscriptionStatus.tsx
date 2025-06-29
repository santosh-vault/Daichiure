import React from 'react';
import { Crown, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { stripeProducts } from '../stripe-config';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading, hasActiveSubscription, isSubscriptionCanceled } = useSubscription();

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl shadow-2xl p-4 animate-pulse border border-gray-800">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  // Show subscription status if user has an active subscription
  if (subscription && hasActiveSubscription()) {
    const product = stripeProducts.find(p => p.priceId === subscription.price_id);
    const productName = product?.name || 'Premium Plan';

    return (
      <div className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 rounded-xl shadow-2xl p-4 border border-amber-600">
        <div className="flex items-center space-x-3">
          <Crown className="h-5 w-5 text-gray-950" />
          <div className="flex-1">
            <h3 className="font-bold font-['Bruno_Ace_SC']">{productName}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-800">
              {subscription.current_period_end && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {isSubscriptionCanceled() ? 'Expires' : 'Renews'} on{' '}
                    {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subscription.payment_method_brand && subscription.payment_method_last4 && (
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-3 w-3" />
                  <span>
                    {subscription.payment_method_brand.toUpperCase()} ****{subscription.payment_method_last4}
                  </span>
                </div>
              )}
            </div>
            {isSubscriptionCanceled() && (
              <p className="text-xs text-red-800 mt-1 font-medium">
                Your subscription will not renew automatically
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show purchase status for individual games
  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl p-4 border border-gray-800">
      <div className="flex items-center space-x-3">
        <ShoppingBag className="h-5 w-5 text-amber-400" />
        <div className="flex-1">
          <h3 className="font-bold text-amber-400">Individual Purchases</h3>
          <p className="text-sm text-gray-400">
            You can purchase games individually or subscribe for full access
          </p>
        </div>
      </div>
    </div>
  );
};