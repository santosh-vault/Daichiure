import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, BarChart2, Loader2 } from 'lucide-react';

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; loading: boolean }> = ({ title, value, icon, loading }) => (
  <div className="bg-gray-800/80 rounded-2xl p-6 shadow-lg border border-gray-700 flex items-center gap-6">
    <div className="bg-amber-400/20 text-amber-400 p-4 rounded-full ring-4 ring-amber-400/10">
      {icon}
    </div>
    <div>
      <div className="text-gray-400 text-lg font-semibold">{title}</div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-700 rounded animate-pulse mt-1" />
      ) : (
        <div className="text-3xl font-extrabold text-white">{value}</div>
      )}
    </div>
  </div>
);

export const AnalyticsPanel: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalArticles: 0, newUsersLast7Days: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch total users
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

        // Fetch total articles
        const { count: totalArticles } = await supabase.from('blogs').select('*', { count: 'exact', head: true });

        // Fetch new users in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: newUsersLast7Days } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());
        
        setStats({
          totalUsers: totalUsers || 0,
          totalArticles: totalArticles || 0,
          newUsersLast7Days: newUsersLast7Days || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 p-8" style={fontStyle}>
      <h1 className="text-3xl font-extrabold text-white mb-6 flex items-center gap-2">
        <BarChart2 className="w-7 h-7 text-amber-400" />
        Analytics Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-8 h-8" />} loading={loading} />
        <StatCard title="Total Articles" value={stats.totalArticles} icon={<FileText className="w-8 h-8" />} loading={loading} />
        <StatCard title="New Users (7 Days)" value={stats.newUsersLast7Days} icon={<Users className="w-8 h-8" />} loading={loading} />
      </div>
    </section>
  );
}; 