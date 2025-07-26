import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRewards } from "../../hooks/useRewards";
import {
  LogOut,
  User,
  Trophy,
  Settings as SettingsIcon,
  BarChart2,
  Gift,
  Users,
  Copy,
  Loader2,
  Calendar,
  Target,
  Star,
  Zap,
  BookOpen,
  Gamepad2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fontStyle = { fontFamily: "Helvetica, Arial, sans-serif" };

const SECTIONS = [
  { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
  { id: "rewards", label: "Rewards", icon: <Trophy className="w-5 h-5" /> },
  {
    id: "progress",
    label: "Progress",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  { id: "referrals", label: "Referrals", icon: <Users className="w-5 h-5" /> },
  {
    id: "transactions",
    label: "Transactions",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon className="w-5 h-5" />,
  },
];

const UserDashboard: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const {
    rewardData,
    loading: rewardsLoading,
    processReferral,
    refreshData,
    redeemFairCoin,
    awardWeeklyFairCoin,
  } = useRewards();
  const navigate = useNavigate();
  const [referralInput, setReferralInput] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [weeklyClaimLoading, setWeeklyClaimLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    setName(user?.user_metadata?.full_name || "");
  }, [user]);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  // Auto-add fair coin when weekly streak is completed
  useEffect(() => {
    if (
      rewardData?.login_streak &&
      rewardData.login_streak >= 7 &&
      rewardData.login_streak % 7 === 0
    ) {
      // Weekly streak completed, check if we should auto-award fair coin
      // Only auto-award once per 7-day cycle to prevent spam
      const hasRecentWeeklyReward = localStorage.getItem(
        `weekly_reward_${rewardData.login_streak}`
      );
      if (!hasRecentWeeklyReward) {
        handleWeeklyStreakReward();
        localStorage.setItem(
          `weekly_reward_${rewardData.login_streak}`,
          "true"
        );
      }
    }
  }, [rewardData?.login_streak]);

  const handleWeeklyStreakReward = async () => {
    try {
      // Auto-award fair coin for weekly streak completion
      await awardWeeklyFairCoin();
      await refreshData();
      // Show a subtle success notification
      console.log("🎉 Weekly streak completed! Fair coin automatically added.");
    } catch (error: any) {
      // Don't show errors for auto-rewards to avoid spamming the user
      console.error("Auto weekly streak reward failed:", error);
    }
  };

  const handleClaimWeeklyFairCoin = async () => {
    if (!rewardData?.login_streak || rewardData.login_streak < 7) return;

    setWeeklyClaimLoading(true);
    try {
      // Award a fair coin for the weekly streak
      await awardWeeklyFairCoin();
      await refreshData();
      alert(
        "Weekly fair coin claimed successfully! +1 Fair Coin added to your balance."
      );
    } catch (error: any) {
      const errorMessage = error.message || "Failed to claim weekly fair coin";
      if (errorMessage.includes("already awarded")) {
        alert(
          "You've already claimed your weekly fair coin for this streak. Keep your streak going for the next reward!"
        );
      } else {
        alert("Failed to claim weekly fair coin. Please try again.");
      }
      console.error("Weekly claim error:", error);
    } finally {
      setWeeklyClaimLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCopyReferral = () => {
    if (rewardData?.referral_code) {
      navigator.clipboard.writeText(rewardData.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleProcessReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) return;
    setReferralLoading(true);
    try {
      await processReferral(referralInput.trim());
      setReferralInput("");
      await refreshData();
      alert("Referral code applied!");
    } catch (err) {
      alert("Failed to process referral code.");
    } finally {
      setReferralLoading(false);
    }
  };

  const handleRedeemFairCoin = async () => {
    if (!rewardData || !rewardData.fair_coins || rewardData.fair_coins < 1)
      return;
    setRedeemLoading(true);
    try {
      await redeemFairCoin();
      await refreshData();
      alert("Fair coin redeemed for 100 coins!");
    } catch (error) {
      alert("Failed to redeem fair coin");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleEditName = () => setEditingName(true);
  const handleCancelEditName = () => {
    setEditingName(false);
    setName(user?.user_metadata?.full_name || "");
  };
  const handleSaveName = async () => {
    if (!name.trim() || name === user?.user_metadata?.full_name) {
      setEditingName(false);
      return;
    }
    setNameLoading(true);
    try {
      await updateProfile({ full_name: name.trim() });
      setEditingName(false);
    } catch (err) {
      alert("Failed to update name.");
    } finally {
      setNameLoading(false);
    }
  };

  if (!user) {
    return (
      <div
        className="min-h-screen bg-gray-100 flex items-center justify-center"
        style={fontStyle}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://www.gravatar.com/avatar/${
    user.email ? md5(user.email.trim().toLowerCase()) : ""
  }?d=identicon`;
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "N/A";
  const dailyProgress = rewardData?.daily_progress
    ? Math.round(rewardData.daily_progress * 100)
    : 0;
  const weeklyProgress = rewardData?.weekly_progress
    ? Math.round(rewardData.weekly_progress * 100)
    : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 py-10 px-2 flex flex-col md:flex-row items-start"
      style={fontStyle}
    >
      {/* Logout button top right */}
      <div className="fixed top-32 right-8 z-50">
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-black font-bold shadow-lg hover:bg-yellow-400 transition text-lg"
          onClick={handleSignOut}
          title="Logout"
        >
          <LogOut size={22} /> <span className="hidden md:inline">Logout</span>
        </button>
      </div>
      {/* Sidebar */}
      <aside className="sticky top-24 left-0 md:w-64 w-full md:mr-6 md:ml-20 mb-8 md:mb-0 z-10">
        <div className="relative h-full">
          <nav className="glassmorphism bg-gradient-to-br from-gray-900/80 via-gray-950/80 to-black/80 rounded-3xl shadow-2xl border border-gray-800 border-l-4 border-l-amber-400 p-6 flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible gap-2 md:gap-0">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                className={`flex items-center gap-3 px-6 py-5 md:py-6 w-full text-left font-bold text-lg tracking-wide transition-colors border-b md:border-b-0 md:border-l-4 border-transparent hover:bg-gray-800/80 hover:text-amber-400 ${
                  activeSection === section.id
                    ? "text-amber-400 bg-gray-800/80 md:border-amber-400 shadow-inner"
                    : "text-gray-200"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="hidden md:inline-block">{section.label}</span>
              </button>
            ))}
          </nav>
          {/* Vertical divider for desktop */}
          <div className="hidden md:block absolute top-0 right-0 h-full w-6">
            <div className="h-full w-1 mx-auto bg-gradient-to-b from-amber-400/30 via-gray-700/30 to-transparent rounded-full" />
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto space-y-8 md:pl-2">
        {/* Profile Section */}
        {activeSection === "profile" && (
          <section
            id="profile"
            className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-3xl p-6 shadow-2xl border border-gray-800 flex flex-col md:grid md:grid-cols-2 items-center gap-6 overflow-hidden"
          >
            {/* Decorative background gradient blob */}
            <div className="absolute -top-10 -left-10 w-56 h-56 bg-gradient-to-br from-amber-400/30 via-pink-400/10 to-blue-400/10 rounded-full blur-2xl opacity-60 pointer-events-none" />
            <div className="relative flex flex-col items-center justify-center">
              <span className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-400/60 via-pink-400/30 to-blue-400/30 blur-lg opacity-60" />
              <div className="bg-gradient-to-br from-amber-100/30 via-white/10 to-blue-100/10 rounded-full p-2 shadow-xl">
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-32 h-32 rounded-full border-4 border-amber-400 shadow-2xl ring-4 ring-amber-200/40"
                />
              </div>
            </div>
            <div className="flex flex-col items-start justify-center gap-4">
              <div className="flex items-center gap-3 mb-2">
                {editingName ? (
                  <>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-5 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition w-64 text-xl shadow"
                      disabled={nameLoading}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={nameLoading}
                      className="ml-2 px-4 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition flex items-center shadow"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEditName}
                      disabled={nameLoading}
                      className="ml-1 px-4 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition flex items-center shadow"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                      {name || "No Name"}
                    </h1>
                    <button
                      onClick={handleEditName}
                      className="ml-2 px-3 py-2 rounded-xl bg-amber-400 text-black font-bold hover:bg-yellow-400 transition flex items-center shadow"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <div className="text-xl text-gray-300 mb-1 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" /> {user.email}
              </div>
              <div className="text-base text-gray-400 mb-1">
                Joined: {joinDate}
              </div>
              <div className="text-xs text-gray-500">
                User ID: <span className="break-all">{user.id}</span>
              </div>
            </div>
          </section>
        )}
        {/* Rewards Section */}
        {activeSection === "rewards" && (
          <section
            id="rewards"
            className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-amber-400 flex items-center gap-2">
              <Trophy className="inline" size={22} /> Rewards Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard
                label="Coins"
                value={rewardData?.coins ?? 0}
                icon={<Trophy className="text-amber-400" />}
              />
              <StatCard
                label="Fair Coins"
                value={rewardData?.fair_coins ?? 0}
                icon={<Gift className="text-blue-400" />}
              />
              <StatCard
                label="USD Value"
                value={
                  rewardData?.coins
                    ? `$${((rewardData.coins / 1000000) * 9).toFixed(2)}`
                    : "$0.00"
                }
                icon={<Zap className="text-green-400" />}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 text-lg text-amber-400">
                  <Trophy className="h-5 w-5" /> Daily Earnings:{" "}
                  <span className="font-bold">
                    {rewardData?.daily_coin_earnings ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg text-blue-400">
                  <Gift className="h-5 w-5" /> Daily Limit:{" "}
                  <span className="font-bold">
                    {rewardData?.daily_limit ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg text-pink-400">
                  <Zap className="h-5 w-5" /> Daily Remaining:{" "}
                  <span className="font-bold">
                    {rewardData?.daily_remaining ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-4">
                <div className="flex items-center gap-2 text-lg text-green-400">
                  <Calendar className="h-5 w-5" /> Login Streak:{" "}
                  <span className="font-bold">
                    {rewardData?.login_streak ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg text-blue-400">
                  <Star className="h-5 w-5" /> Days to Next Fair Coin:{" "}
                  <span className="font-bold">
                    {rewardData?.days_to_next_fair_coin ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Progress Section */}
        {activeSection === "progress" && (
          <section
            id="progress"
            className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
              <BarChart2 className="inline" size={22} /> Progress & Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card: Login Streak */}
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-6 shadow">
                <div className="flex items-center gap-2 text-lg text-green-400">
                  <Calendar className="h-5 w-5" /> Login Streak
                </div>
                <div className="text-3xl font-bold text-green-300">
                  {rewardData?.login_streak ?? 0}
                </div>
              </div>
              {/* Card: Days to Next Fair Coin */}
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-6 shadow">
                <div className="flex items-center gap-2 text-lg text-blue-400">
                  <Star className="h-5 w-5" /> Days to Next Fair Coin
                </div>
                <div className="text-3xl font-bold text-blue-300">
                  {rewardData?.days_to_next_fair_coin ?? 0}
                </div>
              </div>
              {/* Card: Fair Coins with progress bar and redeem button */}
              <div className="flex flex-col gap-4 bg-gray-800/60 rounded-xl p-6 shadow col-span-2">
                <div className="flex items-center gap-2 text-lg text-amber-400">
                  <Gift className="h-5 w-5" /> Fair Coins
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-amber-300">
                    {rewardData?.fair_coins ?? 0}
                  </div>
                  <button
                    className={`px-5 py-2 rounded-lg font-bold shadow transition ${
                      rewardData?.fair_coins && rewardData.fair_coins > 0
                        ? "bg-amber-400 text-black hover:bg-yellow-400"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleRedeemFairCoin}
                    disabled={
                      !rewardData?.fair_coins ||
                      rewardData.fair_coins < 1 ||
                      redeemLoading
                    }
                  >
                    {redeemLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Redeem Fair Coin"
                    )}
                  </button>
                </div>
                {/* Weekly Login Streak Claim Button */}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-300">Weekly Streak:</span>
                  <span className="font-bold text-blue-400">
                    {rewardData?.login_streak ?? 0} days
                  </span>
                  <button
                    className={`px-4 py-2 rounded-lg font-bold shadow transition text-sm ${
                      rewardData?.login_streak && rewardData.login_streak >= 7
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleClaimWeeklyFairCoin}
                    disabled={
                      !rewardData?.login_streak ||
                      rewardData.login_streak < 7 ||
                      weeklyClaimLoading
                    }
                  >
                    {weeklyClaimLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : rewardData?.login_streak &&
                      rewardData.login_streak >= 7 ? (
                      "Claim Weekly Fair Coin"
                    ) : (
                      `${7 - (rewardData?.login_streak ?? 0)} days left`
                    )}
                  </button>
                </div>
                {/* Progress bar for next fair coin (login streak / 7) */}
                <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                  <span>Progress to next Fair Coin:</span>
                  <span className="font-bold text-amber-400">
                    {rewardData?.login_streak ?? 0} / 7 days
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mt-1">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        ((rewardData?.login_streak ?? 0) / 7) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              {/* Card: Coins */}
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-6 shadow">
                <div className="flex items-center gap-2 text-lg text-amber-400">
                  <Trophy className="h-5 w-5" /> Coins
                </div>
                <div className="text-3xl font-bold text-amber-300">
                  {rewardData?.coins ?? 0}
                </div>
              </div>
              {/* Card: Daily Earnings */}
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-6 shadow">
                <div className="flex items-center gap-2 text-lg text-pink-400">
                  <Zap className="h-5 w-5" /> Daily Earnings
                </div>
                <div className="text-3xl font-bold text-pink-300">
                  {rewardData?.daily_coin_earnings ?? 0}
                </div>
              </div>
              {/* Card: Daily Limit */}
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-6 shadow">
                <div className="flex items-center gap-2 text-lg text-blue-400">
                  <Gift className="h-5 w-5" /> Daily Limit
                </div>
                <div className="text-3xl font-bold text-blue-300">
                  {rewardData?.daily_limit ?? 0}
                </div>
              </div>
              {/* Card: Daily Remaining */}
              <div className="flex flex-col gap-2 bg-gray-800/60 rounded-xl p-6 shadow">
                <div className="flex items-center gap-2 text-lg text-pink-400">
                  <Zap className="h-5 w-5" /> Daily Remaining
                </div>
                <div className="text-3xl font-bold text-pink-300">
                  {rewardData?.daily_remaining ?? 0}
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Referrals Section */}
        {activeSection === "referrals" && (
          <section
            id="referrals"
            className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
              <Users className="inline" size={22} /> Referrals
            </h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-200">
                  Your Referral Code:
                </span>
                <span className="text-2xl font-mono px-4 py-2 rounded bg-neutral-800 text-amber-400">
                  {rewardData?.referral_code || "N/A"}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="ml-2 px-2 py-1 rounded bg-amber-400 text-black font-bold hover:bg-yellow-400 transition flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="text-xs text-gray-400">
                Share this code with friends to earn bonus coins!
              </div>
            </div>
            <form
              onSubmit={handleProcessReferral}
              className="flex flex-col md:flex-row gap-2 items-center mb-2"
            >
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder="Enter referral code"
                className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition w-full md:w-64"
                disabled={referralLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-purple-500 text-white font-bold hover:bg-purple-600 transition flex items-center gap-2"
                disabled={referralLoading}
              >
                {referralLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Apply Referral"
                )}
              </button>
            </form>
          </section>
        )}
        {/* Transactions Section */}
        {activeSection === "transactions" && (
          <section
            id="transactions"
            className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-amber-400 flex items-center gap-2">
              <BookOpen className="inline" size={22} /> Recent Transactions
            </h2>
            {rewardsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              </div>
            ) : rewardData?.transactions &&
              rewardData.transactions.length > 0 ? (
              <div className="space-y-3">
                {rewardData.transactions.slice(0, 10).map((tx, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">
                        {tx.description}
                      </p>
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
          </section>
        )}
        {/* Settings Section */}
        {activeSection === "settings" && (
          <section
            id="settings"
            className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-pink-400 flex items-center gap-2">
              <SettingsIcon className="inline" size={22} /> Settings
            </h2>
            <div className="text-gray-400">Settings coming soon...</div>
          </section>
        )}
      </div>
    </div>
  );
};

// Helper: gravatar md5
function md5(str: string) {
  // Simple JS implementation for gravatar hash (not cryptographically secure, but fine for avatar)
  // Source: https://stackoverflow.com/a/16573331
  var xl;
  var rotateLeft = function (lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };
  var addUnsigned = function (lX: number, lY: number) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = lX & 0x80000000;
    lY8 = lY & 0x80000000;
    lX4 = lX & 0x40000000;
    lY4 = lY & 0x40000000;
    lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ lX8 ^ lY8;
    }
  };
  var _F = function (x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  };
  var _G = function (x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  };
  var _H = function (x: number, y: number, z: number) {
    return x ^ y ^ z;
  };
  var _I = function (x: number, y: number, z: number) {
    return y ^ (x | ~z);
  };
  var _FF = function (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  var _GG = function (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  var _HH = function (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  var _II = function (
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };
  var convertToWordArray = function (str: string) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 =
      (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] =
        lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };
  var wordToHex = function (lValue: number) {
    var WordToHexValue = "",
      WordToHexValue_temp = "",
      lByte,
      lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(
        WordToHexValue_temp.length - 2,
        2
      );
    }
    return WordToHexValue;
  };
  var x = [],
    k,
    AA,
    BB,
    CC,
    DD,
    a,
    b,
    c,
    d,
    S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22,
    S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20,
    S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23,
    S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;
  str = unescape(encodeURIComponent(str));
  x = convertToWordArray(str);
  a = 0x67452301;
  b = 0xefcdab89;
  c = 0x98badcfe;
  d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = _FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = _FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = _FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = _FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = _FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = _FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = _FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = _FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = _FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = _FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = _FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = _FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = _FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = _FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = _FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = _FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = _GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = _GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = _GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = _GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = _GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = _GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = _GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = _GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = _GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = _GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = _GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = _GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = _GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = _GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = _GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = _GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = _HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = _HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = _HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = _HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = _HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = _HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = _HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = _HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = _HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = _HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = _HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = _HH(b, c, d, a, x[k + 6], S34, 0x04881d05);
    a = _HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = _HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = _HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = _HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = _II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = _II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = _II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = _II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = _II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = _II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = _II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = _II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = _II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = _II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = _II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = _II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = _II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = _II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = _II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = _II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (
    wordToHex(a) +
    wordToHex(b) +
    wordToHex(c) +
    wordToHex(d)
  ).toLowerCase();
}

// StatCard helper
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-6 flex flex-col items-center shadow-lg">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-amber-400">{value}</div>
      <div className="text-sm text-neutral-300">{label}</div>
    </div>
  );
}

export default UserDashboard;
