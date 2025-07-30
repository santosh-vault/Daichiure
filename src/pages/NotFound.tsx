import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Home, Search, Gamepad2 } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Daichiure</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist. Explore our free games collection instead!"
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.daichiure.live/404" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-amber-400 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-400 mb-8">
              The page you're looking for doesn't exist. But don't worry, we
              have plenty of games to keep you entertained!
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 rounded-lg font-bold hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>

            <Link
              to="/games"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-amber-400 rounded-lg font-bold hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 ml-4"
            >
              <Gamepad2 className="h-5 w-5 mr-2" />
              Browse Games
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-sm">
              Looking for something specific? Try our{" "}
              <Link
                to="/games"
                className="text-amber-400 hover:text-amber-300 underline"
              >
                games collection
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
