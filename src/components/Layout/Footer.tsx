import React from "react";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Heart,
  Shield,
  Zap,
  Users,
  Star,
  Crown,
  Globe,
  Smartphone,
} from "lucide-react";

export const Footer: React.FC = () => {
  const quickLinks = [
    { name: "All Games", path: "/games", icon: Gamepad2 },
    { name: "Categories", path: "/categories", icon: Globe },
    { name: "Premium Games", path: "/games?premium=true", icon: Crown },
    { name: "Mobile Games", path: "/games?platform=mobile", icon: Smartphone },
  ];

  const companyLinks = [
    { name: "About Us", path: "/about" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Contact Support", path: "/contact" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, url: "https://github.com" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
    { name: "Facebook", icon: Facebook, url: "https://facebook.com" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com" },
    { name: "YouTube", icon: Youtube, url: "https://youtube.com" },
  ];

  const features = [
    { icon: Zap, title: "Instant Play", description: "No downloads required" },
    { icon: Shield, title: "Safe & Secure", description: "100% browser-based" },
    {
      icon: Users,
      title: "Multiplayer Ready",
      description: "Play with friends",
    },
    { icon: Star, title: "Premium Content", description: "Exclusive games" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gray-800/50">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950"></div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20">
          {/* Single Row Layout - All Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 items-start">
            {/* Enhanced Brand Section */}
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex flex-col items-center lg:items-start space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-700 p-3 rounded-2xl shadow-2xl">
                      <img
                        src="/logo.png"
                        alt="Daichiure Logo"
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-20"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-bruno-ace gradient-text">
                      Daichiure
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Your Ultimate Gaming Destination
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed text-center lg:text-left max-w-xs">
                  Discover hundreds of classic HTML5 games, from retro arcade
                  favorites to modern puzzles. Play instantly in your browser.
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {features.slice(0, 2).map((feature, index) => (
                    <div
                      key={index}
                      className="glass rounded-full px-3 py-1 border border-white/10 hover-lift group"
                    >
                      <div className="flex items-center space-x-2">
                        <feature.icon className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-gray-300 font-medium">
                          {feature.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Quick Links */}
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-lg font-bold gradient-text flex items-center space-x-3 mb-4 justify-center lg:justify-start">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
                  <Zap className="h-4 w-4 text-gray-950" />
                </div>
                <span>Quick Links</span>
              </h3>
              <ul className="space-y-3 flex flex-col items-center lg:items-start">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 transition-all duration-300 group hover-lift"
                    >
                      <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Company */}
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-lg font-bold gradient-text flex items-center space-x-3 mb-4 justify-center lg:justify-start">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
                  <Shield className="h-4 w-4 text-gray-950" />
                </div>
                <span>Company</span>
              </h3>
              <ul className="space-y-3 flex flex-col items-center lg:items-start">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover-lift text-sm font-medium block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Social Links */}
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-lg font-bold gradient-text flex items-center space-x-3 mb-4 justify-center lg:justify-start">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-gray-950" />
                </div>
                <span>Connect</span>
              </h3>
              <div className="space-y-3 flex flex-col items-center lg:items-start">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 transition-all duration-300 group hover-lift"
                  >
                    <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section - Copyright */}
        <div className="border-t border-white/10 glass">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>&copy; 2025 Daichiure. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Made with</span>
                <Heart className="h-4 w-4 text-red-500 hidden sm:inline animate-pulse" />
                <span className="hidden sm:inline">for gamers</span>
              </div>
              <div className="flex items-center space-x-8">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  Terms
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-amber-400 transition-colors duration-300 text-sm"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
