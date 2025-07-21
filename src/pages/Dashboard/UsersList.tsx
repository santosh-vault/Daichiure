import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Trash2, Edit, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UsersListProps {
  users: User[];
  loading: boolean;
  onUserDeleted: () => void; // Callback to refresh users list
}

const UsersList: React.FC<UsersListProps> = ({ users, loading, onUserDeleted }) => {
  const { user: adminUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);

  if (!adminUser || !['admin@playhub.com', 'developer@playhub.com'].includes(adminUser.email || '')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleDeleteClick = (user: User) => {
    setShowDeleteConfirm(user);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: showDeleteConfirm.id },
      });
      if (error) throw error;
      setShowDeleteConfirm(null);
      onUserDeleted(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-0">
      <div className="flex justify-between items-center mb-6 px-6 pt-6">
        <h2 className="text-2xl font-bold text-white">All Users</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-white">
            <thead className="bg-gray-800/60">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-400 hover:text-blue-300 mr-4" title="Edit user (coming soon)" disabled>
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="text-red-500 hover:text-red-400" title="Delete user" onClick={() => handleDeleteClick(user)}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Are you sure?</h2>
            <p className="text-gray-400 mb-6 text-center">Do you really want to delete <strong className="text-amber-400">{showDeleteConfirm.email}</strong>?<br/>This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition">Cancel</button>
              <button onClick={confirmDelete} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList; 