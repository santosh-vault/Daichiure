import React, { useState } from "react";
import { useRewards } from "../hooks/useRewards";
import { useAuth } from "../contexts/AuthContext";
import {
  UserCircle,
  Trophy,
  Gift,
  Users,
  Settings as SettingsIcon,
  BarChart2,
  LogOut,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function UserDashboard() {
  const { rewardData, loading, error, processReferral, refreshData } =
    useRewards();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isClaimingMoney, setIsClaimingMoney] = useState(false);
  const [activeSection, setActiveSection] = useState("rewards");
  const [referralCode, setReferralCode] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);

  // Debug logging
  console.log("🔍 UserDashboard Debug:", {
    loading,
    error,
    rewardData,
    user: user ? { id: user.id, email: user.email } : null,
  });

  // Navigation sections
  const sections = [
    { id: "rewards", label: "Rewards Summary", icon: Trophy },
    { id: "referrals", label: "Referrals", icon: Users },
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsApplyingReferral(true);
    try {
      await processReferral(referralCode.trim());
      toast.success("Referral code applied successfully!");
      setReferralCode("");
      await refreshData(); // Refresh rewards data
    } catch (error) {
      toast.error("Failed to apply referral code. Please try again.");
    } finally {
      setIsApplyingReferral(false);
    }
  };

  const handleClaimMoney = async () => {
    if (!rewardData || rewardData.coins < 1000000) {
      toast.error("You need at least 1,000,000 coins to claim money!");
      return;
    }

    setIsClaimingMoney(true);
    try {
      // Here you would implement the actual money claiming logic
      // For now, we'll just show a success message
      toast.success(
        "Money claim request submitted! You will be contacted within 24 hours."
      );

      // You might want to call an API endpoint here to handle the claim
      // const response = await fetch('/api/claim-money', { method: 'POST' });
    } catch (error) {
      toast.error("Failed to submit claim request. Please try again.");
    } finally {
      setIsClaimingMoney(false);
    }
  };

  // Check if user can claim money (has 1M+ coins)
  const canClaimMoney = rewardData && rewardData.coins >= 1000000;

  return (
    <div className="min-h-screen bg-black text-white font-['Helvetica'] py-10 px-2">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Heading */}
          <h1 className="text-3xl font-bold mb-2 text-center text-[#FFD700]">
            User Dashboard
          </h1>
          <div className="text-center text-neutral-400 mb-6">
            Welcome, {user?.email?.split("@")[0] || "User"}!
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-neutral-400 mb-6">
            <button
              onClick={() => navigate("/")}
              className="hover:text-amber-400 transition-colors"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <span className="text-amber-400">Dashboard</span>
          </div>

          {/* Mobile Section Navigation */}
          <div className="lg:hidden bg-neutral-900 rounded-xl p-4 mb-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-amber-400">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeSection === section.id
                      ? "bg-amber-400 text-black font-semibold"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-amber-400"
                  }`}
                >
                  <section.icon size={18} />
                  <span className="text-sm">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rewards Summary */}
          <section
            id="rewards"
            className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2">
              <Trophy className="inline" size={22} /> Rewards Summary
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD700]"></div>
                <span className="ml-3 text-neutral-300">
                  Loading rewards data...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
                <h3 className="text-red-400 font-semibold mb-2">
                  Error Loading Rewards
                </h3>
                <p className="text-red-300 text-sm mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : rewardData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <StatCard
                    label="Coins"
                    value={rewardData.coins ?? 0}
                    icon={<Trophy className="text-[#FFD700]" />}
                  />
                  <StatCard
                    label="Fair Coins"
                    value={rewardData.fair_coins ?? 0}
                    icon={<Gift className="text-[#FFD700]" />}
                  />
                  <StatCard
                    label="Login Streak"
                    value={rewardData.login_streak ?? 0}
                    icon={<BarChart2 className="text-[#FFD700]" />}
                  />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>Daily Progress</span>
                    <span>
                      {Math.round((rewardData.daily_progress ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-[#FFD700] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (rewardData.daily_progress ?? 0) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>Weekly Streak</span>
                    <span>
                      {Math.round((rewardData.weekly_progress ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-[#FFD700] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (rewardData.weekly_progress ?? 0) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  Total Value:{" "}
                  <span className="text-[#FFD700]">
                    NPR {rewardData.total_value_npr?.toFixed(2)}
                  </span>
                </div>
                <div className="mb-4">
                  Daily Remaining:{" "}
                  <span className="text-[#FFD700]">
                    {rewardData.daily_remaining}
                  </span>
                </div>
                <div className="mb-4">
                  Referral Code:{" "}
                  <span className="text-[#FFD700]">
                    {rewardData.referral_code || "N/A"}
                  </span>
                </div>

                {/* Claim Money Integration */}
                <div className="mt-6 p-4 bg-neutral-800 rounded-lg border border-amber-400/20">
                  <h3 className="text-lg font-semibold mb-3 text-[#FFD700] flex items-center gap-2">
                    <DollarSign size={20} /> Money Claim Status
                  </h3>
                  <div className="mb-3">
                    <div className="flex justify-between mb-2">
                      <span>Progress to 1M coins</span>
                      <span className="text-[#FFD700]">
                        {rewardData.coins.toLocaleString()} / 1,000,000
                      </span>
                    </div>
                    <div className="w-full h-3 bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-green-500 to-[#FFD700] rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (rewardData.coins / 1000000) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      {Math.round((rewardData.coins / 1000000) * 100)}% complete
                    </div>
                  </div>

                  {canClaimMoney ? (
                    <button
                      onClick={handleClaimMoney}
                      disabled={isClaimingMoney}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isClaimingMoney ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign size={18} />
                          Claim NPR {(rewardData.coins * 0.001).toFixed(2)} Now!
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full px-4 py-3 rounded-lg bg-neutral-700 text-neutral-400 text-center text-sm">
                      Collect {(1000000 - rewardData.coins).toLocaleString()}{" "}
                      more coins to claim money
                    </div>
                  )}
                </div>

                <div className="mb-4">Transactions:</div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#FFD700] text-left">
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewardData.transactions?.map((tx, i) => (
                        <tr key={i} className="border-b border-neutral-800">
                          <td>
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td>{tx.type}</td>
                          <td className="text-[#FFD700]">{tx.amount}</td>
                          <td>{tx.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-6 text-center">
                <h3 className="text-yellow-400 font-semibold mb-2">
                  No Rewards Data Available
                </h3>
                <p className="text-yellow-300 text-sm mb-4">
                  Your rewards data could not be loaded. This might be because:
                </p>
                <ul className="text-yellow-300 text-sm text-left max-w-md mx-auto mb-4">
                  <li>• You haven't played any games yet</li>
                  <li>• Your account is still being set up</li>
                  <li>• There's a temporary server issue</li>
                </ul>
                <button
                  onClick={() => navigate("/games")}
                  className="px-6 py-3 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Play Games to Earn Rewards
                </button>
              </div>
            )}
          </section>

          {/* Profile Info */}
          <section
            id="profile"
            className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2">
              <UserCircle className="inline" size={22} /> Profile
            </h2>
            <div className="flex items-center space-x-4 mb-6">
              <UserCircle size={48} className="text-[#FFD700]" />
              <div>
                <div className="text-lg font-semibold">{user?.email}</div>
              </div>
            </div>
            <div className="text-neutral-400">
              More profile features coming soon...
            </div>
          </section>

          {/* Referrals */}
          <section
            id="referrals"
            className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2">
              <Users className="inline" size={22} /> Referrals
            </h2>

            {/* Apply Referral Code */}
            <div className="bg-neutral-800 rounded-lg p-4 mb-6 border border-amber-400/20">
              <h3 className="text-lg font-semibold mb-3 text-amber-400">
                Apply Referral Code
              </h3>
              <p className="text-neutral-300 text-sm mb-4">
                Enter a friend's referral code to earn bonus coins for both of
                you!
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) =>
                    setReferralCode(e.target.value.toUpperCase())
                  }
                  className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <button
                  onClick={handleApplyReferral}
                  disabled={isApplyingReferral || !referralCode.trim()}
                  className="px-6 py-2 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApplyingReferral ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      Applying...
                    </>
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>

            {/* Your Referral Code */}
            <div className="mb-4">Your Referral Code:</div>
            <div className="text-2xl font-mono mb-6 px-4 py-2 rounded bg-neutral-800 inline-block text-[#FFD700]">
              {rewardData?.referral_code || "N/A"}
            </div>
            <div className="mb-4">
              Share this code with friends to earn bonus coins!
            </div>
            <div className="text-neutral-400">
              More referral features coming soon...
            </div>
          </section>

          {/* Settings */}
          <section
            id="settings"
            className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2">
              <SettingsIcon className="inline" size={22} /> Settings
            </h2>
            <div className="mb-4">
              Email: <span className="text-[#FFD700]">{user?.email}</span>
            </div>
            <div className="text-neutral-400">More settings coming soon...</div>
          </section>

          {/* Logout Button */}
          <div className="flex justify-center pt-4">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FFD700] text-black font-bold shadow-lg hover:bg-yellow-400 transition"
              onClick={handleLogout}
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Right Sidebar Navigation */}
        <div className="w-80 space-y-6 hidden lg:block">
          {/* Section Navigation */}
          <div className="bg-neutral-900 rounded-xl p-4 shadow-lg sticky top-6">
            <h3 className="text-lg font-semibold mb-3 text-amber-400">
              Quick Navigation
            </h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                    activeSection === section.id
                      ? "bg-amber-400 text-black font-semibold"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-amber-400"
                  }`}
                >
                  <section.icon size={20} />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats in Sidebar */}
          {rewardData && (
            <div className="bg-neutral-900 rounded-xl p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-amber-400">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Total Coins:</span>
                  <span className="text-amber-400 font-bold">
                    {rewardData.coins.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Fair Coins:</span>
                  <span className="text-amber-400 font-bold">
                    {rewardData.fair_coins}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Login Streak:</span>
                  <span className="text-amber-400 font-bold">
                    {rewardData.login_streak} days
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-700">
                  <div className="text-xs text-neutral-400 mb-1">
                    Progress to 1M coins
                  </div>
                  <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-green-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (rewardData.coins / 1000000) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 text-right">
                    {Math.round((rewardData.coins / 1000000) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Stat Card ---
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-6 flex flex-col items-center shadow-lg">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-[#FFD700]">{value}</div>
      <div className="text-sm text-neutral-300">{label}</div>
    </div>
  );
}
