import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { getSupabaseFunctionUrl } from "../lib/supabase";

// Admin user emails - should match Header.tsx
const ADMIN_EMAILS = ["admin@daichiure.com", "developer@daichiure.com"];

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });

      if (event === "SIGNED_IN") {
        toast.success("Welcome back!");
      } else if (event === "SIGNED_OUT") {
        toast.success("See you later!");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log("Attempting signup with email:", email);
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      console.log(
        "Supabase Key present:",
        !!import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // Determine the correct redirect URL based on environment
      const isProduction = window.location.hostname !== "localhost";
      const redirectTo = isProduction
        ? "https://daichiure.vercel.app/login"
        : "http://localhost:5173/login";

      console.log("Using redirect URL:", redirectTo);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectTo,
        },
      });

      console.log("Signup response:", { error, data });

      if (error) {
        console.error("Signup error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error,
        });
        throw error;
      }

      console.log("Signup successful:", data);

      // Check if user needs email confirmation
      if (
        data.user &&
        !data.user.email_confirmed_at &&
        data.user.confirmation_sent_at
      ) {
        toast.success(
          "Account created! Please check your email to confirm your account before signing in."
        );
      } else if (data.user && data.session) {
        // User is immediately signed in (email confirmation disabled)
        toast.success("Account created successfully! Welcome to Daichiure!");
      } else {
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.message || "Failed to create account";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in with email:", email);

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error,
        });

        // Check for specific error types
        if (error.message.includes("Email not confirmed")) {
          toast.error(
            "Please verify your email before signing in. Check your inbox for the verification link."
          );
          // Don't navigate here, let the user handle it manually
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error(
            "Invalid email or password. Please check your credentials."
          );
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      // Check if user's email is confirmed
      if (data?.user && !data.user.email_confirmed_at) {
        toast.error(
          "Please verify your email before signing in. Check your inbox for the verification link."
        );
        throw new Error("Email not verified");
      }

      console.log("Sign in successful for user:", data?.user?.email);

      // Award login coins only for regular users, not admins
      const user = data?.user;
      if (user && !ADMIN_EMAILS.includes(user.email || "")) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const accessToken = session?.access_token;

          // Check if we can get the function URL
          let functionUrl;
          try {
            functionUrl = getSupabaseFunctionUrl("award-coins");
          } catch (urlError) {
            console.error("Failed to get function URL:", urlError);
            return; // Don't break login if function URL fails
          }

          await fetch(functionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
            body: JSON.stringify({ user_id: user.id, activity: "login" }),
          });
        } catch (e) {
          console.error("Failed to award login coins:", e);
          // Don't throw error - login should still succeed even if coin awarding fails
        }
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Sign in failed");
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateProfile = async (data: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    const { error } = await supabase.auth.updateUser({
      data,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success("Profile updated successfully!");
  };

  const value = {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
