import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics";
import toast from "react-hot-toast";

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user was redirected after email verification
    if (searchParams.get("verified") === "true") {
      toast.success("Email verified successfully! You can now sign in.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await signIn(formData.email, formData.password);
      // Track successful login
      trackEvent("login", "authentication", "success");
      setMessage({ type: "success", text: "Signed in successfully!" });
      setTimeout(() => {
        navigate("/games");
      }, 1500);
    } catch (error) {
      // Track failed login
      trackEvent("login", "authentication", "failed");
      setMessage({
        type: "error",
        text: "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Slide-in popup styles
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => navigate(-1)}
      />
      {/* Slide-in panel */}
      <div className="relative h-full w-full max-w-md bg-gray-900 rounded-l-3xl shadow-2xl border-l border-gray-800 flex flex-col animate-slide-in-right">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-amber-400 bg-gray-800 rounded-full p-2 shadow-lg"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold font-bruno-ace text-amber-400 mb-2 drop-shadow-md">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-lg">Sign in to continue playing</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg mb-6 text-center text-lg font-medium ${
                message.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={true}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 py-3 rounded-lg font-bold text-lg
                         hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
            <p className="text-gray-500 text-sm">
              Admin?{" "}
              <Link
                to="/admin/login"
                className="text-amber-400 hover:text-amber-300 transition-colors duration-200"
              >
                Admin login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
