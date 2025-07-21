import React from 'react';
import { Play, Star, Zap, Shield, Users, ArrowRight } from 'lucide-react';

export const UIEnhancementDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <h1 className="text-5xl font-bruno-ace gradient-text mb-4">
            UI Enhancement Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Showcasing the new modern UI improvements including glassmorphism, animations, and enhanced design elements.
          </p>
        </div>

        {/* Glassmorphism Cards */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-amber-400 text-center mb-8">Glassmorphism Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 hover-lift">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-full w-fit mb-4">
                <Zap className="h-8 w-8 text-gray-950" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Light Glass</h3>
              <p className="text-gray-300">Subtle glassmorphism effect with backdrop blur and transparency.</p>
            </div>
            
            <div className="glass-strong rounded-2xl p-8 hover-lift">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-fit mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Strong Glass</h3>
              <p className="text-gray-300">Enhanced glassmorphism with stronger blur and opacity effects.</p>
            </div>
            
            <div className="card hover-lift">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full w-fit mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Card Style</h3>
              <p className="text-gray-300">Enhanced card design with hover animations and border effects.</p>
            </div>
          </div>
        </section>

        {/* Button Styles */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-amber-400 text-center mb-8">Enhanced Buttons</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <button className="btn-primary">
              <Play className="h-5 w-5" />
              <span>Primary Button</span>
            </button>
            
            <button className="btn-secondary">
              <ArrowRight className="h-5 w-5" />
              <span>Secondary Button</span>
            </button>
            
            <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover-lift">
              <Star className="h-5 w-5" />
              <span>Gradient Button</span>
            </button>
          </div>
        </section>

        {/* Input Styles */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-amber-400 text-center mb-8">Modern Inputs</h2>
          <div className="max-w-md mx-auto space-y-6">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-modern w-full"
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="input-modern w-full"
              />
            </div>
            
            <div className="relative">
              <textarea
                placeholder="Enter your message"
                rows={4}
                className="input-modern w-full resize-none"
              />
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-amber-400 text-center mb-8">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass rounded-2xl p-6 text-center animate-fade-in-up">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-bold text-white mb-2">Fade In Up</h3>
              <p className="text-sm text-gray-300">Smooth entrance animation</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center animate-fade-in-scale">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-bold text-white mb-2">Fade In Scale</h3>
              <p className="text-sm text-gray-300">Scale entrance effect</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center animate-pulse-glow">
              <div className="text-2xl mb-2">💫</div>
              <h3 className="font-bold text-white mb-2">Pulse Glow</h3>
              <p className="text-sm text-gray-300">Glowing pulse effect</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center hover-lift">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-bold text-white mb-2">Hover Lift</h3>
              <p className="text-sm text-gray-300">Hover to see effect</p>
            </div>
          </div>
        </section>

        {/* Gradient Text */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-amber-400 text-center mb-8">Gradient Text</h2>
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bruno-ace gradient-text">
              Animated Gradient
            </h1>
            <p className="text-xl text-gray-300">
              This text has a beautiful animated gradient effect that shifts colors smoothly.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-amber-400 text-center mb-8">Stats Display</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, value: '10K+', label: 'Active Players', color: 'amber' },
              { icon: Star, value: '500+', label: 'Games Available', color: 'blue' },
              { icon: Zap, value: '24/7', label: 'Always Online', color: 'green' },
            ].map((stat, index) => (
              <div key={index} className="glass rounded-2xl p-8 text-center hover-lift">
                <div className={`bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 p-4 rounded-full w-fit mx-auto mb-4`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-bold gradient-text">Ready to Experience?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            These UI enhancements create a modern, engaging experience that keeps users coming back for more.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              <Play className="h-6 w-6" />
              <span>Get Started</span>
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              <ArrowRight className="h-6 w-6" />
              <span>Learn More</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}; 