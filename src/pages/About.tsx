import React from "react";
import { Helmet } from "react-helmet-async";
import { Gamepad2, Shield, Trophy, Users, Zap, Target } from "lucide-react";

const About: React.FC = () => (
  <>
    <Helmet>
      <title>About Us | Daichiure Gaming Platform</title>
      <meta
        name="description"
        content="Learn about Daichiure's mission to revolutionize online gaming with rewards, our commitment to fair play, and our journey in creating the ultimate gaming experience."
      />
    </Helmet>

    <div className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-amber-400">
            About Daichiure
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing online gaming by combining entertainment with
            meaningful rewards, creating a platform where every moment of play
            has value.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-300">Our Story</h2>
            <p className="text-gray-300 leading-relaxed">
              Founded with a vision to transform casual gaming, Daichiure
              emerged from the idea that gaming should be more than just
              entertainment—it should be rewarding in every sense. We recognized
              that millions of people spend countless hours playing games
              online, and we wanted to give that time real value.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our platform brings together the best of classic and modern HTML5
              games, all playable instantly in your browser without any
              downloads. From nostalgic arcade games to innovative new
              experiences, we curate a diverse collection that appeals to gamers
              of all ages and preferences.
            </p>
            <p className="text-gray-300 leading-relaxed">
              What sets us apart is our innovative rewards system that turns
              your gaming achievements into tangible benefits, creating a gaming
              ecosystem where skill and dedication are truly recognized.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-300">Our Mission</h2>
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/30 rounded-xl p-6">
              <p className="text-gray-200 leading-relaxed text-lg font-medium">
                "To create the world's most engaging and rewarding gaming
                platform, where every player can discover amazing games, improve
                their skills, and earn meaningful rewards while being part of a
                vibrant gaming community."
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We believe gaming should be accessible, fair, and rewarding for
              everyone. Whether you're a casual player looking for quick
              entertainment or a dedicated gamer seeking new challenges,
              Daichiure provides an inclusive environment where everyone can
              thrive.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-amber-300 text-center mb-12">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-amber-200">
                Rewarding Gameplay
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our unique coin system rewards your gaming achievements. Earn
                coins through gameplay, daily logins, and our referral program,
                giving real value to your gaming time.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                <Zap className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-amber-200">
                Instant Play
              </h3>
              <p className="text-gray-300 leading-relaxed">
                No downloads, no installations, no waiting. All our games run
                directly in your browser using cutting-edge HTML5 technology for
                seamless, instant gaming experiences.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-amber-200">
                Fair & Secure
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Built with security and fairness at its core. We use
                industry-standard encryption, secure authentication, and
                maintain strict anti-cheat policies to ensure a level playing
                field.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                <Gamepad2 className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-amber-200">
                Diverse Game Library
              </h3>
              <p className="text-gray-300 leading-relaxed">
                From classic arcade games like Snake and Tetris to modern
                adventures and strategy games, our carefully curated collection
                offers something for every gaming preference.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                <Users className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-amber-200">
                Community Driven
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Join a growing community of gamers who share your passion.
                Connect through our referral system, compete for high scores,
                and be part of gaming discussions.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600/20 rounded-full mb-4">
                <Target className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-amber-200">
                Premium Experience
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Unlock exclusive games and enhanced features with our premium
                subscription, designed to provide the ultimate gaming experience
                for dedicated players.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-amber-300 mb-6">
              Our Technology
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-200 mb-2">
                  Modern Web Technologies
                </h3>
                <p className="text-gray-300 text-sm">
                  Built with React, TypeScript, and the latest web standards for
                  optimal performance and user experience.
                </p>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-200 mb-2">
                  Secure Infrastructure
                </h3>
                <p className="text-gray-300 text-sm">
                  Powered by Supabase for authentication and database
                  management, with Stripe for secure payment processing.
                </p>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-200 mb-2">
                  Cross-Platform Compatibility
                </h3>
                <p className="text-gray-300 text-sm">
                  Optimized for all devices and browsers, ensuring seamless
                  gameplay whether you're on desktop, tablet, or mobile.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-amber-300 mb-6">
              Our Commitment
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-200 mb-2">
                  Player-First Approach
                </h3>
                <p className="text-gray-300 text-sm">
                  Every decision we make prioritizes player experience,
                  fairness, and enjoyment above all else.
                </p>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-200 mb-2">
                  Continuous Innovation
                </h3>
                <p className="text-gray-300 text-sm">
                  We're constantly adding new games, features, and improvements
                  based on community feedback and gaming trends.
                </p>
              </div>
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-amber-200 mb-2">
                  Responsible Gaming
                </h3>
                <p className="text-gray-300 text-sm">
                  We promote healthy gaming habits and provide tools to help
                  players maintain a balanced approach to gaming.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-700/30 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-amber-300 mb-4">
            Join Our Gaming Revolution
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
            Ready to experience gaming like never before? Join thousands of
            players who have already discovered the excitement of earning while
            playing. Create your account today and start your rewarding gaming
            journey with Daichiure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Playing Today
            </a>
            <a
              href="/games"
              className="border border-amber-600 text-amber-400 hover:bg-amber-600/10 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Explore Our Games
            </a>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Have questions about Daichiure? We'd love to hear from you.{" "}
            <a
              href="/contact"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </div>
  </>
);

export default About;
