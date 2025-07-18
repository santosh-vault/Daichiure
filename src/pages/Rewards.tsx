import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Gift,
  UserPlus,
  ArrowRight,
  CheckCircle,
  Info,
  Loader2,
  Trophy,
  Coins,
  TrendingUp,
  Share2,
  XCircle, // Added for error messages
  Sparkles, // Added for success messages
  // Envelope, // Commented out in case not available
  Mail,
  LogIn as LogInIcon // Add login icon
} from 'lucide-react';
import { getSupabaseFunctionUrl } from '../lib/supabase';
import { supabase } from '../lib/supabase';

// Animation for fade-in (you might define this in a CSS file or directly use Tailwind's animation classes)
// For example, in your tailwind.config.js:
// theme: {
//   extend: {
//     keyframes: {
//       fadeIn: {
//         '0%': { opacity: 0, transform: 'translateY(10px)' },
//         '100%': { opacity: 1, transform: 'translateY(0)' },
//       },
//     },
//     animation: {
//       'fade-in': 'fadeIn 0.5s ease-out forwards',
//     },
//   },
// },


const REDEEM_THRESHOLD = 1000000;

const RewardFAQ = [
  {
    q: 'How do I earn coins?',
    a: 'Play games, visit daily, refer friends, and share blogs to earn coins. Each activity gives you a different amount!'
  },
  {
    q: 'What are Fair Play Coins?',
    a: 'Fair Play Coins are special rewards for visiting every day for a week. They unlock exclusive perks in the future!'
  },
  {
    q: 'How do I redeem my coins?',
    a: 'Once you reach 1,000,000 coins, you can redeem them for real rewards. Click the redeem button and follow the instructions.'
  },
  {
    q: 'How do referrals work?',
    a: 'Invite friends using their email. When they join and play, you get bonus coins!'
  },
  {
    q: 'Where can I see my reward history?',
    a: 'Scroll down to the Recent Transactions section to see all your reward activity.'
  },
];

const Rewards: React.FC = () => {
  const { user } = useAuth();
  const [coinData, setCoinData] = useState<{ coins: number; fair_play_coins: number; daily_coin_earnings: number; transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Consolidated message state for better UX
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string | null }>(
    { type: null, text: null }
  );

  const [redeemLoading, setRedeemLoading] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [fairRedeemLoading, setFairRedeemLoading] = useState(false);

  // Helper to show messages
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage({ type: null, text: null });
    }, 5000); // Message disappears after 5 seconds
    return () => clearTimeout(timer); // Cleanup on unmount
  };

  const fetchCoinData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(getSupabaseFunctionUrl('get-reward-data'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoinData(data);
      } else {
        setCoinData(null);
        showMessage('error', data.error || 'Failed to load reward data.'); // Show error if data fetch fails
      }
    } catch (e) {
      showMessage('error', 'Network error. Could not fetch reward data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only refetch when user changes

  const handleRedeem = async () => {
    if (!user) {
      showMessage('error', 'Please log in to redeem coins.');
      return;
    }
    setRedeemLoading(true);
    setMessage({ type: null, text: null }); // Clear previous messages
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(getSupabaseFunctionUrl('redeem-coins'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Redemption successful! Your rewards are being processed.');
        fetchCoinData(); // Refresh coin data
      } else {
        showMessage('error', data.error || 'Redemption failed. Please try again.');
      }
    } catch (e) {
      showMessage('error', 'Network error. Could not complete redemption.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !referralEmail) {
      showMessage('error', 'Please enter a valid email to refer.');
      return;
    }
    setReferralLoading(true);
    setMessage({ type: null, text: null }); // Clear previous messages
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(getSupabaseFunctionUrl('referral'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ referrer_id: user.id, referred_email: referralEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Referral sent! You will earn 2000 coins when they confirm.');
        setReferralEmail(''); // Clear input
      } else {
        showMessage('error', data.error || 'Failed to send referral. Please check the email.');
      }
    } catch (e) {
      showMessage('error', 'Network error. Could not send referral.');
    } finally {
      setReferralLoading(false);
    }
  };

  const handleFairCoinRedeem = async () => {
    if (!user) {
      showMessage('error', 'Please log in to redeem fair play coins.');
      return;
    }
    if (fairPlay < 1) {
      showMessage('error', 'You do not have any fair play coins to redeem.');
      return;
    }
    setFairRedeemLoading(true);
    setMessage({ type: null, text: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const res = await fetch(getSupabaseFunctionUrl('fair-play-coin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ redeem: true, user_id: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Fair play coin redeemed for 20 coins!');
        fetchCoinData();
      } else {
        showMessage('error', data.error || 'Redemption failed.');
      }
    } catch (e) {
      showMessage('error', 'Network error. Could not redeem fair play coin.');
    } finally {
      setFairRedeemLoading(false);
    }
  };

  const coins = coinData?.coins ?? 0;
  const fairPlay = coinData?.fair_play_coins ?? 0;
  const dailyEarnings = coinData?.daily_coin_earnings ?? 0;
  const DAILY_LIMIT = 1200;
  const dailyLeft = Math.max(0, DAILY_LIMIT - dailyEarnings);
  const progress = Math.min(1, coins / REDEEM_THRESHOLD);
  const coinsToNext = Math.max(0, REDEEM_THRESHOLD - coins);
  const canRedeem = coins >= REDEEM_THRESHOLD;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">Please Log In</h2>
          <p className="text-gray-300 mb-6">To view your awesome rewards, you need to be logged in.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-amber-500 text-gray-900 px-6 py-3 rounded-full font-semibold
                       hover:bg-amber-400 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75"
          >
            <ArrowRight className="mr-2 h-5 w-5" /> Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 py-10 px-4 font-inter relative">
      {/* Subtle background texture overlay (Optional, needs CSS/Tailwind config) */}
      {/* <div className="absolute inset-0 bg-[url('/path/to/subtle-noise.png')] opacity-10 pointer-events-none"></div> */}

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Hero Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
            <Gift className="h-14 w-14 text-primary animate-bounce" />
            <h1 className="text-5xl font-extrabold text-primary tracking-wide">My Rewards</h1>
          </div>
          <div className="text-xl text-gray-600">Welcome<span className="font-semibold text-primary">{user?.email ? `, ${user.email.split('@')[0]}` : ''}</span>! Track your coins, claim rewards, and invite friends to earn more.</div>
        </div>

        {/* Global Message Display */}
        {message.text && (
          <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-xl flex items-center gap-3 z-50
            ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} animate-fade-in`}
            role="alert"
            aria-live="assertive"
          >
            {message.type === 'success' ? <Sparkles className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            <p className="font-semibold">{message.text}</p>
            <button onClick={() => setMessage({ type: null, text: null })} className="ml-auto text-inherit hover:text-black" aria-label="Close notification">
              &times;
            </button>
          </div>
        )}

        {/* Coin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-200">
            <Coins className="h-14 w-14 text-yellow-400 mb-3 animate-pulse" />
            <div className="text-5xl font-extrabold text-gray-900 mb-1 leading-none">
              {loading ? <Loader2 className="animate-spin text-gray-900" size={36} /> : coins.toLocaleString()}
            </div>
            <div className="text-xl font-semibold text-gray-600">Total Coins</div>
            <div className="absolute top-4 right-4 bg-yellow-100 rounded-full px-4 py-1 text-xs font-bold text-yellow-700 shadow-inner">💰</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center border border-gray-200 relative">
            <Trophy className="h-14 w-14 text-blue-400 mb-3 animate-bounce" />
            <div className="text-5xl font-extrabold text-gray-900 mb-1 leading-none">
              {loading ? <Loader2 className="animate-spin text-gray-900" size={36} /> : fairPlay.toLocaleString()}
            </div>
            <div className="text-xl font-semibold text-gray-600">Fair Play Coins</div>
            <div className="absolute top-4 right-4 bg-blue-100 rounded-full px-4 py-1 text-xs font-bold text-blue-700 shadow-inner">🏆</div>
            <button
              className={`mt-6 px-6 py-2 rounded-full font-bold text-md transition-all duration-200
                ${fairPlay > 0 && !fairRedeemLoading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
              onClick={handleFairCoinRedeem}
              disabled={fairPlay < 1 || fairRedeemLoading}
            >
              {fairRedeemLoading ? <Loader2 className="animate-spin inline-block mr-2" size={18} /> : null}
              Redeem 1 Fair Coin for 20 Coins
            </button>
          </div>
        </div>

        {/* Progress Bar to Next Redemption */}
        <div className="bg-white rounded-xl p-7 shadow-lg mb-12 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-7 w-7 text-yellow-400" />
            <span className="font-bold text-2xl text-gray-800">Reward Progress</span>
          </div>
          {/* Daily Limit Progress */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600">Daily Coin Limit (Game, Visit, Blog Share):</span>
              <span className="font-bold text-gray-800">{dailyEarnings} / {DAILY_LIMIT}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-300 to-green-500 h-4 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (dailyEarnings / DAILY_LIMIT) * 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dailyLeft > 0
                ? `You can still earn ${dailyLeft} coins today from games, visits, and blog shares.`
                : 'You have reached your daily coin limit for games, visits, and blog shares.'}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 mb-3 overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-full rounded-full transition-all duration-700 ease-out flex items-center justify-center"
              style={{ width: `${progress * 100}%` }}
            >
              {coins > 0 && (
                <span className="text-gray-900 text-sm font-bold">
                  {Math.round(progress * 100)}%
                </span>
              )}
            </div>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">
                {REDEEM_THRESHOLD.toLocaleString()} Coins
            </span>
          </div>
          <div className="text-gray-600 text-md text-center">
            {canRedeem ? (
              <span className="font-semibold text-green-600">Congratulations! You've reached the redemption threshold! 🎉</span>
            ) : (
              `You need ${coinsToNext.toLocaleString()} more coins to redeem your next reward.`
            )}
          </div>
        </div>

        {/* Redeem Section */}
        <div className="bg-white rounded-xl p-7 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border border-gray-200">
          <div className="flex items-center gap-4 text-green-700">
            <CheckCircle className="h-10 w-10 flex-shrink-0" />
            <div>
              <div className="font-bold text-2xl">Redeem Your Coins</div>
              <div className="text-gray-600 text-md">Exchange {REDEEM_THRESHOLD.toLocaleString()} coins for real-world rewards.</div>
            </div>
          </div>
          <button
            className={`
              inline-flex items-center justify-center px-10 py-3 rounded-full font-bold text-lg whitespace-nowrap
              transition-all duration-300 ease-in-out transform
              ${canRedeem
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:-translate-y-1'
                : 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-70'
              }
            `}
            onClick={handleRedeem}
            disabled={redeemLoading || !canRedeem}
          >
            {redeemLoading ? <Loader2 className="animate-spin inline-block mr-3" size={24} /> : null}
            {canRedeem ? 'Redeem Now!' : `Earn ${coinsToNext.toLocaleString()} More`}
          </button>
        </div>

        {/* Referral Section */}
        <div className="bg-white rounded-xl p-7 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border border-gray-200">
          <div className="flex items-center gap-4 text-blue-700">
            <UserPlus className="h-10 w-10 flex-shrink-0" />
            <div>
              <div className="font-bold text-2xl">Refer a Friend & Earn</div>
              <div className="text-gray-600 text-md">Invite friends and get <span className="font-semibold text-blue-700">+5,000 Coins</span> for each successful referral!</div>
            </div>
          </div>
          <form onSubmit={handleReferral} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Friend's email"
                value={referralEmail}
                onChange={e => setReferralEmail(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none w-full
                           focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-inner border border-gray-300"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-200
                         flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
              disabled={referralLoading}
            >
              {referralLoading ? <Loader2 className="animate-spin" size={20} /> : <Share2 className="h-5 w-5" />}
              <span>Refer Now</span>
            </button>
          </form>
        </div>

        {/* Info/FAQ Section */}
        <div className="bg-white rounded-xl p-7 shadow-lg mb-12 border border-gray-200">
          <div className="flex items-center gap-3 mb-5">
            <Info className="h-7 w-7 text-yellow-400" />
            <span className="font-bold text-2xl text-gray-800">How to Earn & Use Rewards</span>
          </div>
          <ul className="list-none space-y-3 text-gray-700 mb-6 px-2">
            <li className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <span className="text-xl">🎮</span>
              <div>
                <b className="text-yellow-700">Play Games:</b> Earn coins by completing games.
              </div>
            </li>
            <li className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <span className="text-xl">🗓️</span>
              <div>
                <b className="text-yellow-700">Daily Visit:</b> Get coins for visiting every day (daily limit applies).
              </div>
            </li>
            <li className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <span className="text-xl">🔗</span>
              <div>
                <b className="text-yellow-700">Refer Friends:</b> Earn bonus coins for each successful referral.
              </div>
            </li>
            <li className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <span className="text-xl">📢</span>
              <div>
                <b className="text-yellow-700">Share Blogs:</b> Share our blog posts to earn extra coins.
              </div>
            </li>
            <li className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <span className="text-xl">🏆</span>
              <div>
                <b className="text-yellow-700">Fair Play Coins:</b> Visit every day for a week to earn a Fair Play Coin – unlocks exclusive perks!
              </div>
            </li>
            <li className="flex items-start gap-3 pt-1">
              <span className="text-xl">💰</span>
              <div>
                <b className="text-yellow-700">Redeem:</b> Exchange {REDEEM_THRESHOLD.toLocaleString()} coins for exciting real rewards!
              </div>
            </li>
          </ul>

          <div className="border-t border-gray-200 pt-6">
            <div className="font-bold text-2xl text-gray-800 mb-4">Frequently Asked Questions</div>
            <div className="space-y-3">
              {RewardFAQ.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <button
                    className="flex items-center justify-between w-full text-left text-gray-800 hover:text-yellow-600 font-semibold
                               p-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-lg"
                    onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  >
                    <span className="flex items-center gap-3">
                      <ArrowRight className={`h-5 w-5 transition-transform duration-300 ease-in-out ${faqOpen === idx ? 'rotate-90 text-yellow-600' : ''}`} />
                      {item.q}
                    </span>
                    {faqOpen === idx ? <span className="text-yellow-600 text-xl font-bold">-</span> : <span className="text-gray-400 text-xl font-bold">+</span>}
                  </button>
                  {faqOpen === idx && (
                    <div className="p-4 pt-0 ml-8 text-gray-600 text-base animate-fade-in origin-top">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-xl p-7 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-yellow-400" />Recent Reward Transactions
          </h2>
          {loading ? (
            <div className="flex items-center justify-center gap-3 text-gray-400 py-8">
              <Loader2 className="animate-spin" size={24} /> Loading Transactions...
            </div>
          ) : coinData && coinData.transactions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coinData.transactions.map((tx, idx) => (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap capitalize flex items-center gap-3 text-sm font-medium">
                        {tx.type === 'game' && <Gift className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
                        {tx.type === 'referral' && <UserPlus className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                        {tx.type === 'redeem' && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        {tx.type === 'share' && <Share2 className="h-4 w-4 text-pink-400 flex-shrink-0" />}
                        {tx.type === 'visit' && <TrendingUp className="h-4 w-4 text-purple-400 flex-shrink-0" />}
                        {tx.type === 'login' && <LogInIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                        {tx.type === 'fair-coin-redeem' && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        <span>
                          {tx.type === 'game' && 'Game'}
                          {tx.type === 'referral' && 'Referral'}
                          {tx.type === 'redeem' && 'Redeem'}
                          {tx.type === 'share' && 'Blog Share'}
                          {tx.type === 'visit' && 'Visit'}
                          {tx.type === 'login' && 'Login'}
                          {tx.type === 'fair-coin-redeem' && 'Fair Coin Redeem'}
                          {!['game','referral','redeem','share','visit','login','fair-coin-redeem'].includes(tx.type) && tx.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{tx.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              <Info className="inline-block h-6 w-6 mb-2" />
              <p>No reward transactions found yet. Start earning!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;