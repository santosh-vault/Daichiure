import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRewards } from "../hooks/useRewards";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Coins,
  Trophy,
  TrendingUp,
  Share2,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Target,
  Gift,
  Users,
  Zap,
  Star,
} from "lucide-react";
import AdSense from "../components/AdSense";

const Rewards: React.FC = () => {
  const { user } = useAuth();
  const {
    rewardData,
    loading,
    error,
    redeemFairCoin,
    processReferral,
    refreshData,
  } = useRewards();
  const [referralCode, setReferralCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">🔒 Access Required</h1>
          <p className="text-xl mb-8">
            Please log in to view your rewards dashboard.
          </p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-8 py-3 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.7)] transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleRedeemFairCoin = async () => {
    if (!rewardData || rewardData.fair_coins < 1) return;

    setRedeemLoading(true);
    try {
      await redeemFairCoin();
      toast.success("Fair coin redeemed for 100 coins!");
      await refreshData();
    } catch (error) {
      toast.error("Failed to redeem fair coin");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleProcessReferral = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setReferralLoading(true);
    try {
      await processReferral(referralCode.trim());
      toast.success("Referral processed successfully!");
      setReferralCode("");
      await refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to process referral");
    } finally {
      setReferralLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!rewardData?.referral_code) return;

    try {
      await navigator.clipboard.writeText(rewardData.referral_code);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy referral code");
    }
  };

  const shareReferralLink = () => {
    if (!rewardData?.referral_code) return;

    const shareUrl = `${window.location.origin}/register?ref=${rewardData.referral_code}`;
    const shareText = `Join PlayHub and earn rewards! Use my referral code: ${rewardData.referral_code}`;

    if (navigator.share) {
      navigator.share({
        title: "Join PlayHub",
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Referral link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Rewards</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-amber-500 text-gray-950 px-6 py-2 rounded-full font-bold hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!rewardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">No Reward Data</h1>
          <p className="text-gray-300">
            Unable to load your reward information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎁 Rewards Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Track your earnings and boost your rewards!
          </p>
        </div>

        {/* AdSense Banner */}
        <div className="mb-12 flex justify-center">
          <AdSense
            adSlot="1234567890"
            adFormat="auto"
            style={{ minHeight: "250px" }}
            className="max-w-4xl w-full"
          />
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Regular Coins */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Coins className="h-8 w-8 text-amber-400" />
              <span className="text-2xl font-bold text-white">
                {rewardData.coins.toLocaleString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Regular Coins
            </h3>
            <p className="text-gray-300 text-sm">
              Worth ₹{(rewardData.coins * 0.01).toFixed(2)} NPR
            </p>
          </div>

          {/* Fair Coins */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {rewardData.fair_coins}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Fair Coins
            </h3>
            <p className="text-gray-300 text-sm">
              Worth ₹{(rewardData.fair_coins * 1).toFixed(2)} NPR
            </p>
            {rewardData.fair_coins > 0 && (
              <button
                onClick={handleRedeemFairCoin}
                disabled={redeemLoading}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {redeemLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  "Redeem for 100 Coins"
                )}
              </button>
            )}
          </div>

          {/* Total Value */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                ₹{rewardData.total_value_npr.toFixed(2)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Value
            </h3>
            <p className="text-gray-300 text-sm">In Nepali Rupees</p>
          </div>

          {/* Login Streak */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {rewardData.login_streak}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Login Streak
            </h3>
            <p className="text-gray-300 text-sm">
              {rewardData.days_to_next_fair_coin} days to next Fair Coin
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Daily Progress */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2 text-amber-400" />
              Daily Progress
            </h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>
                  {rewardData.daily_coin_earnings} / {rewardData.daily_limit}{" "}
                  coins
                </span>
                <span>{Math.round(rewardData.daily_progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${rewardData.daily_progress * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              {rewardData.daily_remaining > 0
                ? `${rewardData.daily_remaining} coins remaining today`
                : "Daily limit reached! Come back tomorrow."}
            </p>
          </div>

          {/* Weekly Streak Progress */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="h-6 w-6 mr-2 text-blue-400" />
              Weekly Streak
            </h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>{rewardData.login_streak} / 7 days</span>
                <span>{Math.round(rewardData.weekly_progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${rewardData.weekly_progress * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              {rewardData.login_streak >= 7
                ? "Streak complete! You earned a Fair Coin!"
                : `${
                    7 - rewardData.login_streak
                  } more days to earn a Fair Coin`}
            </p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Your Referral Code */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-green-400" />
              Your Referral Code
            </h3>
            {rewardData.referral_code ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={rewardData.referral_code}
                    readOnly
                    className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 font-mono text-lg"
                  />
                  <button
                    onClick={copyReferralCode}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={shareReferralLink}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Referral Link
                </button>
                <p className="text-gray-300 text-sm">
                  Earn 1000 coins for each friend who signs up using your code!
                </p>
              </div>
            ) : (
              <p className="text-gray-300">
                Referral code will be generated soon...
              </p>
            )}
          </div>

          {/* Use Referral Code */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Gift className="h-6 w-6 mr-2 text-purple-400" />
              Use Referral Code
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 placeholder-gray-400"
                maxLength={6}
              />
              <button
                onClick={handleProcessReferral}
                disabled={referralLoading || !referralCode.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {referralLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Apply Referral Code"
                )}
              </button>
              <p className="text-gray-300 text-sm">
                Get bonus rewards when you use a friend's referral code!
              </p>
            </div>
          </div>
        </div>

        {/* Earning Tips */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-yellow-400" />
            How to Earn More Coins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-amber-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-amber-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Daily Login</h4>
              <p className="text-gray-300 text-sm">100 coins per day</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Play Games</h4>
              <p className="text-gray-300 text-sm">20 coins per game</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Share Content</h4>
              <p className="text-gray-300 text-sm">5 coins per share</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Refer Friends</h4>
              <p className="text-gray-300 text-sm">1000 coins per referral</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">
            Recent Transactions
          </h3>
          {rewardData.transactions.length > 0 ? (
            <div className="space-y-3">
              {rewardData.transactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-semibold">{tx.description}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      tx.amount > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount} coins
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center py-8">
              No transactions yet. Start earning coins!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
