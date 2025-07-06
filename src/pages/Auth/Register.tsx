import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      // Track successful registration
      trackEvent('signup', 'authentication', 'success');
      setMessage({ type: 'success', text: 'Account created successfully!' });
      setTimeout(() => {
        navigate('/games');
      }, 1500);
    } catch (error) {
      // Track failed registration
      trackEvent('signup', 'authentication', 'failed');
      setMessage({ type: 'error', text: 'Failed to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-inter">
    {/* Container for the form with subtle background pattern */}
    <div className="relative z-10 max-w-md w-full bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-800
                transform transition-all duration-500 ease-in-out hover:scale-[1.01] hover:shadow-[0_0_50px_rgba(255,215,0,0.4)]">
      {/* Abstract background pattern for visual interest inside the card */}
      <div className="absolute inset-0 z-0 opacity-5 rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 46v-4H4v4H0v2h4v4h2v-4h4v-2H6zM36 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 12v-4H4v4H0v2h4v4h2v-4h4v-2H6zM21 2l-2 2 4 4 2-2-4-4zm-4 10l-2 2 4 4 2-2-4-4zM36 48l-2 2 4 4 2-2-4-4zm-4 10l-2 2 4 4 2-2-4-4zM21 42l-2 2 4 4 2-2-4-4zm-4 10l-2 2 4 4 2-2-4-4zM48 2l-2 2 4 4 2-2-4-4zm-4 10l-2 2 4 4 2-2-4-4zM48 42l-2 2 4 4 2-2-4-4zm-4 10l-2 2 4 4 2-2-4-4zM0 0h60v60H0V0zm6 2v-2h2v2H6zm0 6h2v-2H6v2zm0 6h2v-2H6v2zm0 6h2v-2H6v2zm0 6h2v-2H6v2zm0 6h2v-2H6v2zm0 6h2v-2H6v2zm0 6h2v-2H6v2zm0 6h2v-2H6v2zM24 2v-2h2v2h-2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zM42 2v-2h2v2h-2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2zm0 6h2v-2h-2v2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="relative z-10"> {/* Content wrapper for z-index */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-2 drop-shadow-md">Join PlayHub</h2>
          <p className="text-gray-400 text-lg">Create your account to start playing</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-center text-lg font-medium ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                required={true}
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                required={true}
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required={true}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required={true}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-2 text-sm text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 py-3 rounded-lg font-bold text-lg
                       hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};