import React from 'react';
import { useRewards } from '../hooks/useRewards';
import { useAuth } from '../contexts/AuthContext';
import {
  UserCircle,
  Trophy,
  Gift,
  Users,
  Settings as SettingsIcon,
  BarChart2,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const gold = 'text-[#FFD700]';

export default function UserDashboard() {
  const { rewardData, loading } = useRewards();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Helvetica'] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-3xl space-y-8">
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2 text-center text-[#FFD700]">User Dashboard</h1>
        <div className="text-center text-neutral-400 mb-6">Welcome, {user?.email?.split('@')[0] || 'User'}!</div>

        {/* Rewards Summary */}
        <section className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2"><Trophy className="inline" size={22}/> Rewards Summary</h2>
          {loading ? (
            <div>Loading...</div>
          ) : rewardData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard label="Coins" value={rewardData.coins ?? 0} icon={<Trophy className="text-[#FFD700]" />} />
                <StatCard label="Fair Coins" value={rewardData.fair_coins ?? 0} icon={<Gift className="text-[#FFD700]" />} />
                <StatCard label="Login Streak" value={rewardData.login_streak ?? 0} icon={<BarChart2 className="text-[#FFD700]" />} />
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Daily Progress</span>
                  <span>{Math.round((rewardData.daily_progress ?? 0) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-[#FFD700] rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((rewardData.daily_progress ?? 0) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Weekly Streak</span>
                  <span>{Math.round((rewardData.weekly_progress ?? 0) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-[#FFD700] rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((rewardData.weekly_progress ?? 0) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="mb-4">Total Value: <span className="text-[#FFD700]">NPR {rewardData.total_value_npr?.toFixed(2)}</span></div>
              <div className="mb-4">Daily Remaining: <span className="text-[#FFD700]">{rewardData.daily_remaining}</span></div>
              <div className="mb-4">Referral Code: <span className="text-[#FFD700]">{rewardData.referral_code || 'N/A'}</span></div>
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
                        <td>{new Date(tx.created_at).toLocaleDateString()}</td>
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
            <div>No reward data found.</div>
          )}
        </section>

        {/* Profile Info */}
        <section className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2"><UserCircle className="inline" size={22}/> Profile</h2>
          <div className="flex items-center space-x-4 mb-6">
            <UserCircle size={48} className="text-[#FFD700]" />
            <div>
              <div className="text-lg font-semibold">{user?.email}</div>
            </div>
          </div>
          <div className="text-neutral-400">More profile features coming soon...</div>
        </section>

        {/* Referrals */}
        <section className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2"><Users className="inline" size={22}/> Referrals</h2>
          <div className="mb-4">Your Referral Code:</div>
          <div className="text-2xl font-mono mb-6 px-4 py-2 rounded bg-neutral-800 inline-block text-[#FFD700]">
            {rewardData?.referral_code || 'N/A'}
          </div>
          <div className="mb-4">Share this code with friends to earn bonus coins!</div>
          <div className="text-neutral-400">More referral features coming soon...</div>
        </section>

        {/* Settings */}
        <section className="bg-neutral-900 rounded-xl p-6 shadow-lg mb-4">
          <h2 className="text-xl font-semibold mb-4 text-[#FFD700] flex items-center gap-2"><SettingsIcon className="inline" size={22}/> Settings</h2>
          <div className="mb-4">Email: <span className="text-[#FFD700]">{user?.email}</span></div>
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
    </div>
  );
}

// --- Stat Card ---
function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-6 flex flex-col items-center shadow-lg">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-[#FFD700]">{value}</div>
      <div className="text-sm text-neutral-300">{label}</div>
    </div>
  );
} 