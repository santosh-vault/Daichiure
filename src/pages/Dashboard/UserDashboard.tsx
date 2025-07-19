import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { User, Settings, FileText, LogOut } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.email}!</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/user-dashboard/profile"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8" />
                <div>
                  <h3 className="text-lg font-semibold">Profile</h3>
                  <p className="text-blue-100">Manage your account</p>
                </div>
              </div>
            </Link>

            <Link
              to="/user-dashboard/settings"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8" />
                <div>
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <p className="text-green-100">Customize your experience</p>
                </div>
              </div>
            </Link>

            <Link
              to="/user-dashboard/history"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8" />
                <div>
                  <h3 className="text-lg font-semibold">History</h3>
                  <p className="text-purple-100">View your activity</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/games"
                className="bg-gray-800 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-center"
              >
                Play Games
              </Link>
              <Link
                to="/blogs"
                className="bg-gray-800 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-center"
              >
                Read Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 