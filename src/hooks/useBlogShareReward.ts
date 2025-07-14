import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useBlogShareReward() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const shareBlog = async (blogId: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/blog-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, blog_id: blogId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('You earned coins for sharing this blog!');
      } else {
        setError(data.error || 'Failed to award coins.');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return { shareBlog, loading, error, success };
} 