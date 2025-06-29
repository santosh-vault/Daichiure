import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refetch } = useSubscription();

  useEffect(() => {
    // Refetch subscription data after successful payment
    if (sessionId) {
      // Wait a moment for webhook to process
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [sessionId, refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-gray-800">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-400">
              Thank you for your purchase. Your subscription is now active.
            </p>
          </div>

          {sessionId && (
            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Session ID</p>
              <p className="text-xs font-mono text-gray-300 break-all">
                {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link
              to="/games"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 py-3 px-6 rounded-lg font-bold hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Start Playing Games</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full border border-gray-700 text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>View Dashboard</span>
            </Link>

            <Link
              to="/"
              className="w-full text-gray-400 hover:text-amber-400 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};