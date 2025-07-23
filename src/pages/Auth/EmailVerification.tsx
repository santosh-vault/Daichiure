import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

export const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if there's an access token in the URL (from email verification link)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");

        console.log("Email verification params:", {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          type,
        });

        if (accessToken && refreshToken && type === "signup") {
          // Set the session with the tokens from the email verification
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session:", error);
            setError("Email verification failed. Please try again.");
            toast.error("Email verification failed. Please try again.");
          } else {
            console.log("Email verification successful:", data);
            setVerified(true);
            toast.success("Email verified successfully! Welcome to PlayHub!");

            // Redirect to games page after a short delay
            setTimeout(() => {
              navigate("/games");
            }, 2000);
          }
        } else if (type === "signup") {
          // URL has signup type but missing tokens
          setError(
            "Email verification incomplete. Please check your email again."
          );
        } else {
          // No verification params, just show the verification page
          setError(null);
        }
      } catch (err) {
        console.error("Email verification error:", err);
        setError("An error occurred during email verification.");
        toast.error("An error occurred during email verification.");
      } finally {
        setLoading(false);
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-300 mb-4">
              Your account has been successfully verified. Redirecting you to
              the games...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-300 mb-4">
            {error
              ? error
              : "Please check your email and click the verification link to activate your account."}
          </p>

          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-300 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
