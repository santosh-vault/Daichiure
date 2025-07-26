import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, X, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics";

// List of common fake/temporary email domains to block
const BLOCKED_DOMAINS = [
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.org",
  "temp-mail.org",
  "throwaway.email",
  "getnada.com",
  "20minutemail.com",
  "fakeinbox.com",
  "dispostable.com",
  "yopmail.com",
  "maildrop.cc",
  "mailnesia.com",
  "trashmail.com",
  "sharklasers.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
];

// Email validation function
const validateEmail = (
  email: string
): { isValid: boolean; message?: string } => {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email format" };
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, message: "Invalid email domain" };
  }

  // Check if domain is in blocked list
  if (BLOCKED_DOMAINS.some((blocked) => domain.includes(blocked))) {
    return {
      isValid: false,
      message:
        "Temporary or disposable email addresses are not allowed. Please use a permanent email address.",
    };
  }

  // Check if domain has proper structure (at least one dot)
  if (!domain.includes(".") || domain.split(".").length < 2) {
    return { isValid: false, message: "Please use a valid email domain" };
  }

  // Check for suspicious patterns
  if (
    domain.includes("temp") ||
    domain.includes("fake") ||
    domain.includes("test")
  ) {
    return { isValid: false, message: "Please use a legitimate email address" };
  }

  // Additional validation for very short domains or suspicious patterns
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 6) {
    return { isValid: false, message: "Please use a valid email domain" };
  }

  return { isValid: true };
};

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useGoogleAnalytics();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time email validation
    if (name === "email" && value) {
      const validation = validateEmail(value);
      if (!validation.isValid && validation.message) {
        setEmailError(validation.message);
      } else {
        setEmailError("");
      }
    } else if (name === "email" && !value) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setMessage({
        type: "error",
        text: emailValidation.message || "Invalid email address",
      });
      setEmailError(emailValidation.message || "Invalid email address");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    // Additional password validation
    if (formData.password.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long",
      });
      return;
    }

    // Check for strong password requirements (Supabase requirements)
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,.\/`~]/.test(
      formData.password
    );

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
      setMessage({
        type: "error",
        text: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*()_+-=[]{};':\"\\|<>?,./`~)",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log("Register form submitting with data:", {
        email: formData.email,
        fullName: formData.fullName,
        passwordLength: formData.password.length,
      });

      await signUp(formData.email, formData.password, formData.fullName);

      // Track successful registration
      trackEvent("signup", "authentication", "success");

      // Show success message but don't navigate immediately
      // Let the user see the success message, then they can navigate manually
      setMessage({
        type: "success",
        text: "Account created successfully! You can now close this window and sign in.",
      });

      // Clear the form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      // Track failed registration
      trackEvent("signup", "authentication", "failed");

      // Handle specific error messages
      let errorMessage = "Failed to create account. Please try again.";
      if (
        error?.message?.includes("already registered") ||
        error?.message?.includes("already exists")
      ) {
        errorMessage =
          "This email is already registered. Please try logging in instead.";
      } else if (
        error?.message?.includes("invalid-email") ||
        error?.message?.includes("Invalid email")
      ) {
        errorMessage = "Please enter a valid email address.";
      } else if (
        error?.message?.includes("weak-password") ||
        error?.message?.includes("weak_password") ||
        error?.code === "weak_password"
      ) {
        errorMessage =
          "Password is too weak. Please ensure it contains uppercase, lowercase, numbers, and special characters.";
      } else if (error?.message?.includes("Password")) {
        errorMessage = error.message; // Show the actual password requirement message
      } else if (error?.message) {
        errorMessage = error.message; // Show the actual error message from Supabase
      }

      console.error("Registration error details:", error);
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Slide-in popup styles
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => navigate(-1)}
      />
      {/* Slide-in panel */}
      <div className="relative h-full w-full max-w-md sm:max-w-lg bg-gray-900 sm:rounded-l-3xl shadow-2xl border-l border-gray-800 flex flex-col animate-slide-in-right overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-20 text-gray-400 hover:text-amber-400 bg-gray-800 rounded-full p-1.5 shadow-lg"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex flex-col justify-start px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-['Bruno_Ace_SC'] text-amber-400 mb-1 drop-shadow-md">
              Join Daichiure
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Create your account to start playing
            </p>
          </div>

          {message && (
            <div
              className={`p-2.5 rounded-lg mb-3 sm:mb-4 text-center text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={true}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required={true}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-800 border text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${
                    emailError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:ring-amber-500"
                  }`}
                  placeholder="Enter your email (e.g., user@gmail.com)"
                />
                {emailError && (
                  <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 h-4 w-4" />
                )}
              </div>
              {emailError && (
                <div className="mt-1 flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Please use a permanent email address. Temporary emails are not
                allowed.
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={true}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {/* Password requirements */}
              <div className="mt-1 text-xs text-gray-500">
                <div className="mb-1">Password must contain:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      formData.password.length >= 8
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    <span>✓</span>
                    <span>8+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      /[a-z]/.test(formData.password)
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    <span>✓</span>
                    <span>Lowercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      /[A-Z]/.test(formData.password)
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    <span>✓</span>
                    <span>Uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      /[0-9]/.test(formData.password)
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    <span>✓</span>
                    <span>Number</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,.\/`~]/.test(
                        formData.password
                      )
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    <span>✓</span>
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required={true}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.password &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                Boolean(emailError) ||
                Boolean(
                  formData.password &&
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                ) ||
                !formData.email ||
                !formData.password ||
                !formData.confirmPassword ||
                !formData.fullName
              }
              className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-gray-950 py-2.5 rounded-lg font-bold text-base
                         hover:shadow-[0_0_25px_rgba(255,215,0,0.7)] transition-all duration-300 ease-in-out transform hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
