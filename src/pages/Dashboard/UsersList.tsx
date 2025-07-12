import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UsersListProps {
  users: User[];
  loading: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({ users, loading }) => {
  if (loading) {
    return <div className="flex justify-center py-10"><span className="animate-spin text-amber-400 w-10 h-10">Loading...</span></div>;
  }
  if (!users.length) {
    return <div className="text-gray-400">No users found.</div>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {users.map(user => (
        <div key={user.id} className="bg-gray-900 rounded-lg p-4 flex flex-col gap-2 shadow hover:shadow-amber-400/20 transition-all border border-gray-700">
          <span className="font-bold text-white flex items-center gap-2"><UserIcon className="w-5 h-5" />{user.email}</span>
          <span className="text-xs text-gray-400 ml-2">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}; 