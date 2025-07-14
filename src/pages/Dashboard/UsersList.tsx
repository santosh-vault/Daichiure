import React, { useEffect, useState } from 'react';
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

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/functions/v1/get-all-rewards');
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">All Users - Rewards</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Coins</th>
                <th className="px-4 py-2 text-left">Fair Play</th>
                <th className="px-4 py-2 text-left">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.coins}</td>
                  <td className="px-4 py-2">{user.fair_play_coins}</td>
                  <td className="px-4 py-2">{user.transaction_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersList;
export { UsersList }; 