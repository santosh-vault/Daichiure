import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  Github, 
  Twitter, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube, 
  Heart, 
  ArrowRight,
  Shield,
  Zap,
  Users,
  Star,
  Crown,
  Globe,
  Smartphone
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const gameCategories = [
    { name: 'Arcade Games', slug: 'arcade', icon: '🎮' },
    { name: 'Puzzle Games', slug: 'puzzle', icon: '🧩' },
    { name: 'Action Games', slug: 'action', icon: '⚔️' },
    { name: 'Adventure Games', slug: 'adventure', icon: '🗺️' },
  ];

  const quickLinks = [
    { name: 'All Games', path: '/games', icon: Gamepad2 },
    { name: 'Categories', path: '/categories', icon: Globe },
    { name: 'Premium Games', path: '/games?premium=true', icon: Crown },
    { name: 'Mobile Games', path: '/games?platform=mobile', icon: Smartphone },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Contact Support', path: '/contact' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com' },
  ];

  const features = [
    { icon: Zap, title: 'Instant Play', description: 'No downloads required' },
    { icon: Shield, title: 'Safe & Secure', description: '100% browser-based' },
    { icon: Users, title: 'Multiplayer Ready', description: 'Play with friends' },
    { icon: Star, title: 'Premium Content', description: 'Exclusive games' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10">

        
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          {/* Top Section - Brand & Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-3 rounded-xl shadow-lg">
                  <Gamepad2 className="h-8 w-8 text-gray-950" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold font-bruno-ace bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    PlayHub
                  </h2>
                  <p className="text-sm text-gray-400">Your Ultimate Gaming Destination</p>
                </div>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                Discover hundreds of classic HTML5 games, from retro arcade favorites to modern puzzles. 
                Play instantly in your browser or unlock premium experiences.
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                    <div className="bg-amber-500/20 p-2 rounded-lg">
                      <feature.icon className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-400">{feature.title}</h4>
                      <p className="text-xs text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-amber-400 mb-2">Stay Updated</h3>
                <p className="text-gray-300">Get notified about new games, updates, and exclusive offers!</p>
              </div>
              <form onSubmit={handleNewsletterSignup} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 px-6 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
              <p className="text-xs text-gray-400 text-center mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>

          {/* Middle Section - Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-6 flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Quick Links</span>
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 transition-colors duration-200 group"
                    >
                      <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Game Categories */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-6 flex items-center space-x-2">
                <Gamepad2 className="h-5 w-5" />
                <span>Categories</span>
              </h3>
              <ul className="space-y-3">
                {gameCategories.map((category) => (
                  <li key={category.slug}>
                    <Link 
                      to={`/categories?category=${category.slug}`}
                      className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 transition-colors duration-200 group"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-6 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Company</span>
              </h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-gray-300 hover:text-amber-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-6 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Connect</span>
              </h3>
              <div className="space-y-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-300 hover:text-amber-400 transition-colors duration-200 group"
                  >
                    <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-400">
                <span>&copy; 2025 PlayHub. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Made with</span>
                <Heart className="h-4 w-4 text-red-500 hidden sm:inline" />
                <span className="hidden sm:inline">for gamers</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="hover:text-amber-400 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};