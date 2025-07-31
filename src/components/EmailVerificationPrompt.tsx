import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface EmailVerificationPromptProps {
  email: string;
  onClose: () => void;
  onResendSuccess?: () => void;
}

export const EmailVerificationPrompt: React.FC<
  EmailVerificationPromptProps
> = ({ email, onClose, onResendSuccess }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const handleResendVerification = async () => {
    if (resendCount >= 3) {
      toast.error("Maximum resend attempts reached. Please try again later.");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) {
        throw error;
      }

      setResendCount((prev) => prev + 1);
      toast.success("Verification email sent! Please check your inbox.");
      onResendSuccess?.();
    } catch (error: any) {
      console.error("Error resending verification:", error);
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Success Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Account Created Successfully!
        </h2>

        {/* Main Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Verify Your Email Address
              </h3>
              <p className="text-sm text-blue-700">
                We've sent a verification link to <strong>{email}</strong>.
                Please check your email and click the verification link to
                activate your account.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs font-bold">
              1
            </div>
            Check your email inbox for the verification message
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs font-bold">
              2
            </div>
            Click the verification link in the email
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs font-bold">
              3
            </div>
            Return to login page and sign in with your credentials
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-yellow-700">
              <strong>Didn't receive the email?</strong> Check your spam folder
              or try resending below.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={isResending || resendCount >= 3}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Resend Verification Email
                {resendCount > 0 && ` (${3 - resendCount} left)`}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            I'll Check My Email Later
          </button>
        </div>

        {/* Email Tips */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <strong>Email not arriving?</strong> Check your spam/junk folder or
            add{" "}
            <span className="font-medium">noreply@mail.app.supabase.io</span> to
            your contacts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPrompt;
