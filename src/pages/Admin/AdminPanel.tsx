import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
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
  Plus
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
}

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
}

interface Purchase {
  id: number;
  user_id: string;
  game_id: number;
  purchase_date: string;
  amount_paid: number;
  user_email: string;
  game_title: string;
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalGames: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'checking' | 'empty' | 'populated'>('unknown');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  console.log('🔐 Admin Panel Access Check:', {
    user: user?.email,
    isAdmin,
    adminEmails: ADMIN_EMAILS
  });

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      checkDatabaseStatus();
    }
  }, [isAdmin]);

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('❌ User is not admin:', user.email);
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-4">You don't have permission to access the admin panel.</p>
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">Current user:</p>
            <p className="text-xs font-mono text-amber-400">{user.email}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-2">Admin emails:</p>
            {ADMIN_EMAILS.map((email, index) => (
              <p key={index} className="text-xs font-mono text-green-400">{email}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Admin access granted for:', user.email);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats
      const [usersResult, gamesResult, purchasesResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('games').select('id', { count: 'exact' }),
        supabase.from('purchases').select('amount_paid', { count: 'exact' })
      ]);

      const totalRevenue = purchasesResult.data?.reduce((sum, purchase) => sum + purchase.amount_paid, 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalGames: gamesResult.count || 0,
        totalPurchases: purchasesResult.count || 0,
        totalRevenue,
        activeSubscriptions: 0 // TODO: Implement subscription counting
      });

      // Load recent users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setUsers(usersData || []);

      // Load recent purchases
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select(`
          id,
          user_id,
          game_id,
          purchase_date,
          amount_paid,
          users!inner(email),
          games!inner(title)
        `)
        .order('purchase_date', { ascending: false })
        .limit(10);

      const formattedPurchases = purchasesData?.map((purchase: any) => ({
        id: purchase.id,
        user_id: purchase.user_id,
        game_id: purchase.game_id,
        purchase_date: purchase.purchase_date,
        amount_paid: purchase.amount_paid,
        user_email: purchase.users.email,
        game_title: purchase.games.title
      })) || [];

      setPurchases(formattedPurchases);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'purchases', name: 'Purchases', icon: CreditCard },
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
            <div className="bg-green-900/20 border border-green-700 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Admin Access</span>
              </div>
              <p className="text-xs text-gray-400">{user.email}</p>
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
                <h2 className="text-xl font-bold text-amber-400 mb-6">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Games</p>
                        <p className="text-2xl font-bold text-green-400">{stats.totalGames}</p>
                      </div>
                      <Database className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Purchases</p>
                        <p className="text-2xl font-bold text-purple-400">{stats.totalPurchases}</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold text-amber-400">${stats.totalRevenue.toFixed(2)}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-amber-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Subs</p>
                        <p className="text-2xl font-bold text-red-400">{stats.activeSubscriptions}</p>
                      </div>
                      <RefreshCw className="h-8 w-8 text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Users */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-amber-400 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white font-medium">{user.full_name || 'Anonymous'}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                          <p className="text-gray-500 text-xs">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Purchases */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-amber-400 mb-4">Recent Purchases</h3>
                    <div className="space-y-3">
                      {purchases.slice(0, 5).map((purchase) => (
                        <div key={purchase.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white font-medium">{purchase.game_title}</p>
                            <p className="text-gray-400 text-sm">{purchase.user_email}</p>
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
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && (
              <div>
                <h2 className="text-xl font-bold text-amber-400 mb-6">Database Management</h2>
                
                {/* Database Status */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Database Status</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className="text-sm text-gray-400">
                        {dbStatus === 'checking' ? 'Checking...' : 
                         dbStatus === 'populated' ? 'Database Ready' : 
                         dbStatus === 'empty' ? 'Database Empty' : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handleAddGamesToDatabase}
                      disabled={actionLoading === 'adding'}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {actionLoading === 'adding' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>{actionLoading === 'adding' ? 'Adding...' : 'Add Games to DB'}</span>
                    </button>
                    
                    <button
                      onClick={checkDatabaseStatus}
                      disabled={dbStatus === 'checking'}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {dbStatus === 'checking' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span>Check Status</span>
                    </button>
                    
                    <button
                      onClick={() => exportData('games')}
                      disabled={actionLoading === 'export-games'}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {actionLoading === 'export-games' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span>Export Games</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Export Data</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => exportData('users')}
                        disabled={actionLoading === 'export-users'}
                        className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Users</span>
                      </button>
                      <button
                        onClick={() => exportData('purchases')}
                        disabled={actionLoading === 'export-purchases'}
                        className="w-full bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Purchases</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Database Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Games:</span>
                        <span className="text-white">{stats.totalGames}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Users:</span>
                        <span className="text-white">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Purchases:</span>
                        <span className="text-white">{stats.totalPurchases}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold text-amber-400 mb-6">User Management</h2>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">All Users</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{user.full_name || 'Anonymous'}</div>
                              <div className="text-sm text-gray-400">{user.id}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
                <h2 className="text-xl font-bold text-amber-400 mb-6">Purchase Management</h2>
                
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">All Purchases</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Game</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {purchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {purchase.game_title}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {purchase.user_email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                              ${purchase.amount_paid.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(purchase.purchase_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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