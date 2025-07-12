import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const fontStyle = { fontFamily: 'Helvetica, Arial, sans-serif' };

// Admin user emails - should match Header.tsx and database policies
const ADMIN_EMAILS = ['admin@playhub.com', 'developer@playhub.com'];

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // Check if user email is in admin list
      const isAdminByEmail = ADMIN_EMAILS.includes(user.email || '');
      
      if (isAdminByEmail) {
        setIsAdmin(true);
        setChecking(false);
        return;
      }

      // Additional check: verify admin role in database
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking user role:', error);
        }

        const hasAdminRole = profile?.role === 'admin';
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading]);

  // Show loading while checking authentication
  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center" style={fontStyle}>
        <div className="text-center">
          <Loader className="h-8 w-8 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!user) {
    toast.error('Please log in to access admin dashboard');
    navigate('/admin/login', { replace: true });
    return null;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    navigate('/', { replace: true });
    return null;
  }

  // Render children if user is authenticated and is admin
  return <>{children}</>;
}; 