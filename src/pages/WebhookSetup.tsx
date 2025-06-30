import React, { useState } from 'react';
import { Copy, Check, AlertCircle, ExternalLink, Webhook, Database, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export const WebhookSetupPage: React.FC = () => {
  const [copiedItems, setCopiedItems] = useState<string[]>([]);

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
    setCopiedItems([...copiedItems, item]);
    setTimeout(() => {
      setCopiedItems(prev => prev.filter(i => i !== item));
    }, 2000);
  };

  const webhookUrl = `https://aepxsvgcoraegvbnhplu.supabase.co/functions/v1/stripe-webhook`;
  const requiredEvents = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'payment_intent.succeeded'
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <Webhook className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-amber-400 mb-2">Webhook Setup Guide</h1>
            <p className="text-gray-400">Configure Stripe webhooks to process payments automatically</p>
          </div>

          {/* Step 1: Get Webhook URL */}
          <div className="mb-8 p-6 bg-blue-900/20 border border-blue-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-blue-400 font-bold text-lg mb-2">Get Your Webhook Endpoint URL</h3>
                <p className="text-gray-300 mb-4">
                  Replace <code className="bg-gray-800 px-2 py-1 rounded text-amber-400">YOUR_SUPABASE_PROJECT_REF</code> with your actual Supabase project reference:
                </p>
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <code className="text-green-400 text-sm break-all">{webhookUrl}</code>
                  <button
                    onClick={() => copyToClipboard(webhookUrl, 'webhook-url')}
                    className="ml-4 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedItems.includes('webhook-url') ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Find your project reference in Supabase Dashboard → Settings → API
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Create Webhook */}
          <div className="mb-8 p-6 bg-amber-900/20 border border-amber-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-amber-500 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-amber-400 font-bold text-lg mb-2">Create Webhook in Stripe</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 mb-2">1. Go to Stripe Dashboard:</p>
                    <a
                      href="https://dashboard.stripe.com/webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                      <span>Open Stripe Webhooks</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-300 mb-2">2. Click "Add endpoint" and configure:</p>
                    <ul className="text-gray-400 text-sm space-y-1 ml-4">
                      <li>• Endpoint URL: Your webhook URL from step 1</li>
                      <li>• Description: "PlayHub Payment Webhook"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Select Events */}
          <div className="mb-8 p-6 bg-green-900/20 border border-green-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-green-400 font-bold text-lg mb-2">Select Required Events</h3>
                <p className="text-gray-300 mb-4">Select these specific events in the Stripe webhook configuration:</p>
                <div className="bg-gray-800 rounded-lg p-4">
                  {requiredEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                      <code className="text-green-400 text-sm">{event}</code>
                      <button
                        onClick={() => copyToClipboard(event, `event-${index}`)}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {copiedItems.includes(`event-${index}`) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Get Webhook Secret */}
          <div className="mb-8 p-6 bg-purple-900/20 border border-purple-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-purple-400 font-bold text-lg mb-2">Get Webhook Secret</h3>
                <div className="space-y-3">
                  <p className="text-gray-300">After creating the webhook:</p>
                  <ol className="text-gray-400 text-sm space-y-1 ml-4">
                    <li>1. Click on your newly created webhook</li>
                    <li>2. Click "Reveal" next to "Signing secret"</li>
                    <li>3. Copy the secret (starts with <code className="bg-gray-800 px-1 rounded text-purple-400">whsec_</code>)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Environment Variables */}
          <div className="mb-8 p-6 bg-red-900/20 border border-red-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-red-400 font-bold text-lg mb-2">Configure Environment Variables</h3>
                <div className="space-y-4">
                  <p className="text-gray-300">Add these to your Supabase project (Settings → Edge Functions):</p>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <code className="text-green-400 text-sm">STRIPE_SECRET_KEY=sk_test_51•••••wvg</code>
                      <button
                        onClick={() => copyToClipboard('STRIPE_SECRET_KEY=sk_test_51•••••wvg', 'secret-key')}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {copiedItems.includes('secret-key') ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-green-400 text-sm">STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here</code>
                      <button
                        onClick={() => copyToClipboard('STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here', 'webhook-secret')}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        {copiedItems.includes('webhook-secret') ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Open Supabase Settings</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Testing Section */}
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="text-amber-400 font-semibold mb-2">Testing Your Webhook</h4>
                <div className="space-y-3 text-gray-300 text-sm">
                  <p>After setup, test with these Stripe test card details:</p>
                  <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs">
                    <div>Card Number: 4242 4242 4242 4242</div>
                    <div>Expiry: Any future date</div>
                    <div>CVC: Any 3 digits</div>
                  </div>
                  <p>Monitor webhook deliveries in Stripe Dashboard → Webhooks → Your webhook → Recent deliveries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="https://dashboard.stripe.com/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              <Webhook className="h-4 w-4" />
              <span>Stripe Webhooks</span>
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Supabase Dashboard</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};