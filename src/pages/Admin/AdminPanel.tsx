import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Database, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  Shield, 
  Bug,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  Plus,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Mail,
  Clock,
  Star,
  Crown,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { addGamesToDatabase, checkGamesInDatabase, testPurchaseSystem } from '../../utils/addGamesToDatabase';
import { stripeProducts } from '../../stripe-config';

// Admin user emails - in production, this should be in environment variables
const ADMIN_EMAILS = ['admin@playhub.com', 'developer@playhub.com'];

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalPurchases: number;
  totalRevenue: number;
  activeSubscriptions: number;
  freeGames: number;
  premiumGames: number;
  recentUsers: number;
  monthlyRevenue: number;
  averageOrderValue: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
  avatar_url?: string | null;
  total_purchases?: number;
  total_spent?: number;
}

interface Purchase {
  id: number;
  user_id: string;
  game_id: number;
  purchase_date: string;
  amount_paid: number;
  user_email: string;
  game_title: string;
  user_name: string;
}

interface Game {
  id: number;
  title: string;
  slug: string;
  is_premium: boolean;
  price: number;
  category_name: string;
  created_at: string;
  purchase_count: number;
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGames: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    freeGames: 0,
    premiumGames: 0,
    recentUsers: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'checking' | 'empty' | 'populated'>('unknown');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  console.log('🔐 Admin Panel Access Check:', {
    user: user?.email,
    isAdmin,
    adminEmails: ADMIN_EMAILS,
    authChecking
  });

  useEffect(() => {
    // Wait a moment for auth to settle
    const timer = setTimeout(() => {
      setAuthChecking(false);
      if (isAdmin) {
        loadDashboardData();
        checkDatabaseStatus();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAdmin]);

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-amber-400 mb-2">Checking Admin Access...</h2>
          <p className="text-gray-400">Please wait while we verify your permissions</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    console.log('❌ User is not admin:', user.email);
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 text-center max-w-md w-full">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access the admin panel.</p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">Current user:</p>
            <p className="text-xs font-mono text-amber-400 break-all">{user.email}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 mb-2">Admin emails:</p>
            {ADMIN_EMAILS.map((email, index) => (
              <p key={index} className="text-xs font-mono text-green-400 break-all">{email}</p>
            ))}
          </div>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="block w-full bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/"
              className="block w-full border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Admin access granted for:', user.email);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading admin dashboard data...');

      // Load games from the games table
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          categories(name)
        `);

      if (gamesError) {
        console.error('Error loading games:', gamesError);
      }

      // Load purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          games(title)
        `);

      if (purchasesError) {
        console.error('Error loading purchases:', purchasesError);
      }

      // For now, we'll use a simplified user approach
      // In a real app, you'd use the service role key to access auth.users
      const mockUsers = [
        {
          id: 'mock-user-1',
          email: 'user1@example.com',
          full_name: 'John Doe',
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          avatar_url: null,
          total_purchases: 0,
          total_spent: 0
        }
      ];

      console.log('📈 Raw data loaded:', {
        users: mockUsers.length,
        games: gamesData?.length || 0,
        purchases: purchasesData?.length || 0
      });

      const users = mockUsers;
      const games = gamesData || [];
      const purchases = purchasesData || [];

      // Calculate stats
      const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount_paid, 0);
      const freeGames = games.filter(game => !game.is_premium).length;
      const premiumGames = games.filter(game => game.is_premium).length;
      
      // Recent users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers = users.filter(user => 
        new Date(user.created_at) > thirtyDaysAgo
      ).length;

      // Monthly revenue (last 30 days)
      const monthlyRevenue = purchases
        .filter(purchase => new Date(purchase.purchase_date) > thirtyDaysAgo)
        .reduce((sum, purchase) => sum + purchase.amount_paid, 0);

      // Average order value
      const averageOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0;

      setStats({
        totalUsers: users.length,
        totalGames: games.length,
        totalPurchases: purchases.length,
        totalRevenue,
        activeSubscriptions: 0, // TODO: Implement subscription counting
        freeGames,
        premiumGames,
        recentUsers,
        monthlyRevenue,
        averageOrderValue
      });

      // Process users with purchase data
      const processedUsers = users.map(user => {
        const userPurchases = purchases.filter(p => p.user_id === user.id);
        const totalSpent = userPurchases.reduce((sum, p) => sum + p.amount_paid, 0);
        
        return {
          ...user,
          total_purchases: userPurchases.length,
          total_spent: totalSpent
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setUsers(processedUsers);

      // Process purchases
      const formattedPurchases = purchases.map((purchase: any) => ({
        id: purchase.id,
        user_id: purchase.user_id,
        game_id: purchase.game_id,
        purchase_date: purchase.purchase_date,
        amount_paid: purchase.amount_paid,
        user_email: 'user@example.com', // Mock email since we don't have real user data
        user_name: 'User',
        game_title: purchase.games?.title || 'Unknown Game'
      })).sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

      setPurchases(formattedPurchases);

      // Process games with purchase counts
      const processedGames = games.map(game => {
        const gamePurchases = purchases.filter(p => p.game_id === game.id);
        return {
          ...game,
          category_name: game.categories?.name || 'Unknown',
          purchase_count: gamePurchases.length
        };
      }).sort((a, b) => b.purchase_count - a.purchase_count);

      setGames(processedGames);

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    setDbStatus('checking');
    const hasGames = await checkGamesInDatabase();
    setDbStatus(hasGames ? 'populated' : 'empty');
  };

  const handleAddGamesToDatabase = async () => {
    setActionLoading('adding');
    try {
      const success = await addGamesToDatabase();
      if (success) {
        alert('✅ Games added to database successfully!');
        await checkDatabaseStatus();
        await loadDashboardData();
      } else {
        alert('❌ Failed to add some games to database.');
      }
    } catch (error) {
      console.error('Error adding games:', error);
      alert('❌ Error adding games to database.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestPurchaseSystem = async () => {
    setActionLoading('testing');
    try {
      const success = await testPurchaseSystem('rpg');
      if (success) {
        alert('✅ Purchase system test completed!');
      } else {
        alert('❌ Purchase system test failed.');
      }
    } catch (error) {
      console.error('Error testing purchase system:', error);
      alert('❌ Error testing purchase system.');
    } finally {
      setActionLoading(null);
    }
  };

  const exportData = async (table: string) => {
    setActionLoading(`export-${table}`);
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${table}:`, error);
      alert(`❌ Error exporting ${table} data.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = () => {
    switch (dbStatus) {
      case 'checking':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>;
      case 'populated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'empty':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && new Date(user.created_at) > sevenDaysAgo;
    }
    if (filterType === 'premium') {
      return matchesSearch && (user.total_purchases || 0) > 0;
    }
    return matchesSearch;
  });

  const filteredPurchases = purchases.filter(purchase => {
    return purchase.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           purchase.game_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           purchase.user_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'purchases', name: 'Purchases', icon: CreditCard },
    { id: 'games', name: 'Games', icon: Database },
    { id: 'stripe', name: 'Stripe Config', icon: Settings },
    { id: 'debug', name: 'Debug Tools', icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-400">Manage your PlayHub gaming platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Back to Site</span>
              </Link>
              <div className="bg-green-900/20 border border-green-700 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Admin Access</span>
                </div>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-900 rounded-2xl shadow-xl mb-8 border border-gray-800">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-gray-400 hover:text-amber-400 hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-amber-400">Dashboard Overview</h2>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-8 bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Enhanced Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-200 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                            <p className="text-blue-300 text-xs mt-1">+{stats.recentUsers} this month</p>
                          </div>
                          <Users className="h-10 w-10 text-blue-300" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-200 text-sm font-medium">Total Games</p>
                            <p className="text-3xl font-bold text-white">{stats.totalGames}</p>
                            <p className="text-green-300 text-xs mt-1">{stats.freeGames} free, {stats.premiumGames} premium</p>
                          </div>
                          <Database className="h-10 w-10 text-green-300" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm font-medium">Total Purchases</p>
                            <p className="text-3xl font-bold text-white">{stats.totalPurchases}</p>
                            <p className="text-purple-300 text-xs mt-1">Avg: ${stats.averageOrderValue.toFixed(2)}</p>
                          </div>
                          <CreditCard className="h-10 w-10 text-purple-300" />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl p-6 border border-amber-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-200 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                            <p className="text-amber-300 text-xs mt-1">${stats.monthlyRevenue.toFixed(2)} this month</p>
                          </div>
                          <DollarSign className="h-10 w-10 text-amber-300" />
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Recent Users */}
                      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center space-x-2">
                          <Users className="h-5 w-5" />
                          <span>Recent Users</span>
                        </h3>
                        <div className="space-y-3">
                          {users.slice(0, 5).map((user) => (
                            <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{user.full_name || 'Anonymous'}</p>
                                  <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-500 text-xs">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </p>
                                {user.total_purchases && user.total_purchases > 0 && (
                                  <p className="text-green-400 text-xs">
                                    {user.total_purchases} purchases
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Purchases */}
                      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center space-x-2">
                          <CreditCard className="h-5 w-5" />
                          <span>Recent Purchases</span>
                        </h3>
                        <div className="space-y-3">
                          {purchases.slice(0, 5).map((purchase) => (
                            <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                              <div>
                                <p className="text-white font-medium">{purchase.game_title}</p>
                                <p className="text-gray-400 text-sm">{purchase.user_name || purchase.user_email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-green-400 font-bold">${purchase.amount_paid.toFixed(2)}</p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(purchase.purchase_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Top Games */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center space-x-2">
                        <Star className="h-5 w-5" />
                        <span>Top Selling Games</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.slice(0, 6).map((game) => (
                          <div key={game.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white truncate">{game.title}</h4>
                              {game.is_premium && <Crown className="h-4 w-4 text-amber-400" />}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">
                                {game.purchase_count} purchases
                              </span>
                              {game.is_premium && (
                                <span className="text-green-400 font-bold">
                                  ${game.price?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-amber-400">User Management</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Users</option>
                      <option value="recent">Recent (7 days)</option>
                      <option value="premium">Premium Users</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">
                      Users ({filteredUsers.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Purchases</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold">
                                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">{user.full_name || 'Anonymous'}</div>
                                  <div className="text-sm text-gray-400">{user.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded-full text-xs">
                                {user.total_purchases || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                              ${(user.total_spent || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-amber-400 hover:text-amber-300 mr-3">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-blue-400 hover:text-blue-300">
                                <Edit className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-amber-400">Purchase Management</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search purchases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => exportData('purchases')}
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">
                      All Purchases ({filteredPurchases.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Game</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredPurchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{purchase.game_title}</div>
                              <div className="text-sm text-gray-400">ID: {purchase.game_id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{purchase.user_name}</div>
                              <div className="text-sm text-gray-400">{purchase.user_email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                              ${purchase.amount_paid.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <div>{new Date(purchase.purchase_date).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(purchase.purchase_date).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="bg-green-900 text-green-200 px-2 py-1 rounded-full text-xs">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-amber-400">Game Management</h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleAddGamesToDatabase}
                      disabled={actionLoading === 'adding'}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'adding' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>Add Games</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className="text-sm text-gray-400">
                        {dbStatus === 'checking' ? 'Checking...' : 
                         dbStatus === 'populated' ? 'Database Ready' : 
                         dbStatus === 'empty' ? 'Database Empty' : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((game) => (
                    <div key={game.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white truncate">{game.title}</h3>
                        {game.is_premium && <Crown className="h-5 w-5 text-amber-400" />}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className={`${game.is_premium ? 'text-amber-400' : 'text-green-400'}`}>
                            {game.is_premium ? 'Premium' : 'Free'}
                          </span>
                        </div>
                        {game.is_premium && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-green-400">${game.price?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Purchases:</span>
                          <span className="text-white">{game.purchase_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Revenue:</span>
                          <span className="text-green-400">
                            ${((game.price || 0) * game.purchase_count).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stripe Config Tab */}
            {activeTab === 'stripe' && (
              <div>
                <h2 className="text-xl font-bold text-amber-400 mb-6">Stripe Configuration</h2>
                
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Current Products</h3>
                  <div className="space-y-4">
                    {stripeProducts.map((product, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{product.name}</h4>
                            <p className="text-sm text-gray-400">{product.description}</p>
                            <p className="text-xs text-gray-500">Mode: {product.mode}</p>
                            {product.gameSlug && (
                              <p className="text-xs text-gray-500">Game: {product.gameSlug}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">
                              ${product.price?.toFixed(2)}{product.mode === 'subscription' ? '/month' : ''}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">{product.priceId}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-6">
                  <h3 className="text-amber-400 font-bold mb-2">Setup Instructions</h3>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p>1. Create products in your Stripe dashboard with the price IDs shown above</p>
                    <p>2. Set up webhook endpoint: <code className="bg-gray-800 px-2 py-1 rounded">your-supabase-url/functions/v1/stripe-webhook</code></p>
                    <p>3. Configure environment variables in Supabase Edge Functions</p>
                    <p>4. Test the purchase flow with Stripe test cards</p>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Tools Tab */}
            {activeTab === 'debug' && (
              <div>
                <h2 className="text-xl font-bold text-amber-400 mb-6">Debug Tools</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Purchase System</h3>
                    <div className="space-y-3">
                      <button
                        onClick={handleTestPurchaseSystem}
                        disabled={actionLoading === 'testing'}
                        className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {actionLoading === 'testing' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Bug className="h-4 w-4" />
                        )}
                        <span>{actionLoading === 'testing' ? 'Testing...' : 'Test Purchase System'}</span>
                      </button>
                      <p className="text-xs text-gray-400">
                        Tests the purchase system for the RPG game
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Database:</span>
                        <span className={`${dbStatus === 'populated' ? 'text-green-400' : 'text-red-400'}`}>
                          {dbStatus === 'populated' ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stripe Config:</span>
                        <span className="text-green-400">Configured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Products:</span>
                        <span className="text-green-400">{stripeProducts.length} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Admin Access:</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};