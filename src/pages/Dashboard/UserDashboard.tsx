import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

interface Game {
  id: number;
  title: string;
  thumbnail_url: string;
  is_premium: boolean;
}

interface Purchase {
  id: number;
  game_id: number;
  purchase_date: string;
  amount_paid: number;
  games: Game;
}

interface Blog {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      // Fetch purchased games
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('id, game_id, purchase_date, amount_paid, games(id, title, thumbnail_url, is_premium)')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });
      setPurchases(purchasesData || []);
      // Fetch recent blogs/news
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('id, title, description, image_url, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      setBlogs(blogsData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white" style={fontStyle}>
        <div className="bg-gray-900 p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in to view your dashboard.</h2>
          <Link to="/login" className="text-amber-400 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 py-10 px-2" style={fontStyle}>
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">My Dashboard</h1>
        {/* Purchased Games */}
        <section className="bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Purchased Games</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : purchases.length === 0 ? (
            <div className="text-gray-400">You have not purchased any games yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="bg-gray-900 rounded-xl p-4 flex flex-col items-center border border-gray-700">
                  {purchase.games?.thumbnail_url && (
                    <img src={purchase.games.thumbnail_url} alt={purchase.games.title} className="w-24 h-24 object-cover rounded mb-2 border-2 border-amber-400" />
                  )}
                  <div className="text-lg font-bold text-amber-300 mb-1">{purchase.games?.title}</div>
                  <div className="text-xs text-gray-400 mb-1">Purchased: {new Date(purchase.purchase_date).toLocaleDateString()}</div>
                  {purchase.games?.is_premium && <span className="text-xs text-amber-400 font-semibold">Premium</span>}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Recent News/Blogs */}
        <section className="bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Latest News & Blogs</h2>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="text-gray-400">No news or blogs found.</div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div key={blog.id} className="flex gap-4 items-center bg-gray-900 rounded-xl p-4 border border-gray-700">
                  {blog.image_url && (
                    <img src={blog.image_url} alt={blog.title} className="w-20 h-20 object-cover rounded-lg border-2 border-amber-400" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-1">
                      {blog.category && <span className="bg-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">{blog.category}</span>}
                    </div>
                    <Link to={`/blogs/${blog.id}`} className="text-lg font-bold text-amber-300 hover:underline">{blog.title}</Link>
                    <div className="text-gray-300 text-sm mb-1">{blog.description}</div>
                    <div className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard; 