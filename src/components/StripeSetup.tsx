import React, { useState } from 'react';
import { CreditCard, Check, AlertCircle, ExternalLink } from 'lucide-react';

export const StripeSetup: React.FC = () => {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: 'Create Stripe Account',
      description: 'Sign up for a Stripe account if you don\'t have one',
      action: 'Visit stripe.com',
      link: 'https://stripe.com',
    },
    {
      title: 'Get API Keys',
      description: 'Copy your publishable and secret keys from the Stripe dashboard',
      action: 'Go to API Keys',
      link: 'https://dashboard.stripe.com/apikeys',
    },
    {
      title: 'Create Products',
      description: 'Set up your subscription and individual game products',
      action: 'Create Products',
      link: 'https://dashboard.stripe.com/products',
    },
    {
      title: 'Configure Webhooks',
      description: 'Set up webhook endpoints for payment processing',
      action: 'Setup Webhooks',
      link: 'https://dashboard.stripe.com/webhooks',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <CreditCard className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Stripe Integration Setup</h1>
          <p className="text-gray-400">Follow these steps to complete your Stripe integration</p>
        </div>

        <div className="space-y-6">
          {steps.map((stepItem, index) => (
            <div
              key={index}
              className={`border rounded-xl p-6 transition-all duration-300 ${
                step > index + 1
                  ? 'border-green-500 bg-green-500/10'
                  : step === index + 1
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      step > index + 1
                        ? 'bg-green-500 text-white'
                        : step === index + 1
                        ? 'bg-amber-500 text-gray-900'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{stepItem.title}</h3>
                    <p className="text-gray-400">{stepItem.description}</p>
                  </div>
                </div>
                <a
                  href={stepItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                >
                  <span>{stepItem.action}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-700 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Environment Variables</h4>
              <p className="text-gray-300 text-sm mb-3">
                Make sure to set these environment variables in your Supabase project:
              </p>
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-gray-300">
                <div>STRIPE_SECRET_KEY=sk_test_...</div>
                <div>STRIPE_WEBHOOK_SECRET=whsec_...</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-amber-900/20 border border-amber-700 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-amber-400 font-semibold mb-2">Webhook Configuration</h4>
              <p className="text-gray-300 text-sm mb-3">
                Configure your webhook endpoint URL in Stripe dashboard:
              </p>
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-gray-300">
                https://your-project-ref.supabase.co/functions/v1/stripe-webhook
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Select these events: checkout.session.completed, customer.subscription.created, 
                customer.subscription.updated, customer.subscription.deleted, payment_intent.succeeded
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setStep(step < 4 ? step + 1 : 1)}
            className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-900 px-6 py-3 rounded-lg font-bold hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300"
          >
            {step < 4 ? 'Mark as Complete' : 'Reset Steps'}
          </button>
        </div>
      </div>
    </div>
  );
};