import React from 'react';
import { StripeSetup } from '../components/StripeSetup';

export const StripeSetupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <StripeSetup />
    </div>
  );
};