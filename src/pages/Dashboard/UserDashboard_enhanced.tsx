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
  ChevronDown,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fontStyle = { fontFamily: "Inter, system-ui, -apple-system, sans-serif" };

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
        `weekly_reward_${Math.floor(rewardData.login_streak / 7)}`
      );
      if (!hasRecentWeeklyReward) {
        handleWeeklyStreakReward();
        localStorage.setItem(
          `weekly_reward_${Math.floor(rewardData.login_streak / 7)}`,
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
      // Show a success notification
      alert(
        "🎉 Weekly streak completed! +1 Fair Coin automatically added to your balance!"
      );
      console.log("🎉 Weekly streak completed! Fair coin automatically added.");
    } catch (error: any) {
      // Don't show errors for auto-rewards to avoid spamming the user
      console.error("Auto weekly streak reward failed:", error);
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
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
        style={fontStyle}
      >
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-400 border-r-transparent mx-auto animate-spin animation-delay-150"></div>
          </div>
          <p className="mt-6 text-purple-200 text-lg font-medium">
            Loading your dashboard...
          </p>
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

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      style={fontStyle}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 via-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-bl from-blue-400/15 via-purple-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse animation-delay-300" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-green-400/15 via-purple-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse animation-delay-700" />
      </div>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 z-50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop logout button */}
      <div className="hidden lg:block fixed top-6 right-6 z-50">
        <button
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 border border-purple-400/20"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          <span>Logout</span>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur opacity-50"></div>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="lg:w-80 w-full lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="p-4 lg:p-6">
            {/* Desktop sidebar */}
            <nav className="hidden lg:block bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-purple-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h2>
                <p className="text-slate-400 text-sm">
                  Manage your rewards & progress
                </p>
              </div>
              <div className="space-y-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className={`group flex items-center gap-4 px-6 py-4 w-full text-left font-medium text-base rounded-2xl transition-all duration-300 ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 shadow-lg border border-purple-500/30"
                        : "text-slate-300 hover:text-purple-300 hover:bg-slate-800/50 border border-transparent hover:border-purple-500/20"
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                      {section.icon}
                    </span>
                    <span>{section.label}</span>
                    {activeSection === section.id && (
                      <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Mobile horizontal scroll navigation */}
            <nav className="lg:hidden bg-gradient-to-r from-slate-800/95 via-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 p-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className={`flex flex-col items-center gap-2 px-4 py-3 min-w-[80px] font-medium text-xs rounded-xl transition-all duration-200 whitespace-nowrap ${
                      activeSection === section.id
                        ? "bg-gradient-to-b from-purple-500/20 to-pink-500/20 text-purple-300 shadow-lg border border-purple-500/30"
                        : "text-slate-300 hover:text-purple-300 hover:bg-slate-800/50"
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full lg:max-w-none px-4 lg:pr-6 pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <section className="relative bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-purple-900/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-700/50 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-blue-500/15 via-purple-500/10 to-green-500/10 rounded-full blur-2xl" />

                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Avatar section */}
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-blue-500/30 blur-lg"></div>
                      <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-500 to-pink-500 shadow-2xl">
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Name editing */}
                    <div className="w-full max-w-sm">
                      {editingName ? (
                        <div className="flex gap-2 mb-4">
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-800/80 text-white border border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition"
                            disabled={nameLoading}
                            placeholder="Enter your name"
                          />
                          <button
                            onClick={handleSaveName}
                            disabled={nameLoading}
                            className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEditName}
                            disabled={nameLoading}
                            className="px-4 py-3 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mb-4">
                          <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {name || "Welcome User"}
                          </h1>
                          <button
                            onClick={handleEditName}
                            className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User info */}
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                      <div className="flex items-center gap-3 text-slate-300 mb-2">
                        <User className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">Email</span>
                      </div>
                      <p className="text-white font-mono text-sm break-all">
                        {user.email}
                      </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                      <div className="flex items-center gap-3 text-slate-300 mb-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">Member Since</span>
                      </div>
                      <p className="text-white">{joinDate}</p>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                      <div className="flex items-center gap-3 text-slate-300 mb-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">User ID</span>
                      </div>
                      <p className="text-white font-mono text-xs break-all">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Rewards Section */}
            {activeSection === "rewards" && (
              <section className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Rewards Overview
                  </h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    label="Total Coins"
                    value={rewardData?.coins ?? 0}
                    icon={<Trophy className="text-yellow-400" />}
                    color="from-yellow-500 to-orange-500"
                    bgColor="from-yellow-500/10 to-orange-500/10"
                  />
                  <StatCard
                    label="Fair Coins"
                    value={rewardData?.fair_coins ?? 0}
                    icon={<Gift className="text-blue-400" />}
                    color="from-blue-500 to-indigo-500"
                    bgColor="from-blue-500/10 to-indigo-500/10"
                  />
                  <StatCard
                    label="USD Value"
                    value={
                      rewardData?.coins
                        ? `$${((rewardData.coins / 1000000) * 9).toFixed(2)}`
                        : "$0.00"
                    }
                    icon={<Zap className="text-green-400" />}
                    color="from-green-500 to-emerald-500"
                    bgColor="from-green-500/10 to-emerald-500/10"
                  />
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Daily Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Earnings Today</span>
                        <span className="font-bold text-yellow-400">
                          {rewardData?.daily_coin_earnings ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Daily Limit</span>
                        <span className="font-bold text-blue-400">
                          {rewardData?.daily_limit ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Remaining</span>
                        <span className="font-bold text-green-400">
                          {rewardData?.daily_remaining ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Streak Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Login Streak</span>
                        <span className="font-bold text-purple-400">
                          {rewardData?.login_streak ?? 0} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Next Fair Coin</span>
                        <span className="font-bold text-blue-400">
                          {rewardData?.days_to_next_fair_coin ?? 0} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Progress Section */}
            {activeSection === "progress" && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Progress & Analytics
                  </h2>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ProgressCard
                    title="Login Streak"
                    value={rewardData?.login_streak ?? 0}
                    maxValue={7}
                    unit="days"
                    color="from-green-500 to-emerald-500"
                    icon={<Calendar className="w-6 h-6" />}
                  />
                  <ProgressCard
                    title="Fair Coins"
                    value={rewardData?.fair_coins ?? 0}
                    maxValue={10}
                    unit="coins"
                    color="from-blue-500 to-indigo-500"
                    icon={<Gift className="w-6 h-6" />}
                  />
                  <ProgressCard
                    title="Total Earnings"
                    value={rewardData?.coins ?? 0}
                    maxValue={1000000}
                    unit="coins"
                    color="from-yellow-500 to-orange-500"
                    icon={<Trophy className="w-6 h-6" />}
                  />
                </div>

                {/* Fair Coin Redemption */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Fair Coin Management
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">
                          Available Fair Coins
                        </span>
                        <span className="text-2xl font-bold text-blue-400">
                          {rewardData?.fair_coins ?? 0}
                        </span>
                      </div>

                      <button
                        className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          rewardData?.fair_coins && rewardData.fair_coins > 0
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:scale-105"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
                        onClick={handleRedeemFairCoin}
                        disabled={
                          !rewardData?.fair_coins ||
                          rewardData.fair_coins < 1 ||
                          redeemLoading
                        }
                      >
                        {redeemLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          "Redeem Fair Coin (100 coins)"
                        )}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Weekly Progress</span>
                        <span className="text-sm font-medium text-purple-400">
                          {rewardData?.login_streak ?? 0} / 7 days
                        </span>
                      </div>

                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              ((rewardData?.login_streak ?? 0) / 7) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <div
                        className={`text-center px-4 py-2 rounded-lg text-sm font-medium ${
                          rewardData?.login_streak &&
                          rewardData.login_streak >= 7
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {rewardData?.login_streak &&
                        rewardData.login_streak >= 7
                          ? "✓ Auto-Claiming Fair Coins"
                          : `${
                              7 - (rewardData?.login_streak ?? 0)
                            } days to Fair Coin`}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Referrals Section */}
            {activeSection === "referrals" && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Referral Program
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-purple-400 mb-6">
                    Your Referral Code
                  </h3>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-mono font-bold text-purple-400">
                            {rewardData?.referral_code || "Loading..."}
                          </span>
                          <button
                            onClick={handleCopyReferral}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                          >
                            <Copy className="w-4 h-4" />
                            {copied ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProcessReferral} className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-300">
                      Enter a Referral Code
                    </h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={referralInput}
                        onChange={(e) => setReferralInput(e.target.value)}
                        placeholder="Enter referral code"
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 outline-none transition"
                        disabled={referralLoading}
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        disabled={referralLoading}
                      >
                        {referralLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {/* Transactions Section */}
            {activeSection === "transactions" && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Transaction History
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  {rewardsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    </div>
                  ) : rewardData?.transactions &&
                    rewardData.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {rewardData.transactions.slice(0, 10).map((tx, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:bg-slate-700/50 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                tx.amount > 0
                                  ? "bg-green-500/20"
                                  : "bg-red-500/20"
                              }`}
                            >
                              {tx.amount > 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {tx.description}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </div>
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
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-300 text-lg">
                        No transactions yet
                      </p>
                      <p className="text-slate-500">
                        Start earning coins to see your transaction history!
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl flex items-center justify-center">
                    <SettingsIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent">
                    Settings
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <div className="text-center py-12">
                    <SettingsIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">
                      Settings Coming Soon
                    </p>
                    <p className="text-slate-500">
                      We're working on adding more customization options!
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper: gravatar md5 function
function md5(str: string) {
  // Simple JS implementation for gravatar hash
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

// Enhanced StatCard component
function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 overflow-hidden group hover:scale-105 transition-all duration-300`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      ></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

// New ProgressCard component
function ProgressCard({
  title,
  value,
  maxValue,
  unit,
  color,
  icon,
}: {
  title: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}) {
  const percentage = Math.min(100, (value / maxValue) * 100);

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>{icon}</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-slate-400 text-sm">{unit}</span>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-slate-400">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
