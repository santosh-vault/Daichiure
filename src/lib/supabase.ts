import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseFunctionUrl(functionName: string): string {
  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable');
  }
  
  // Extract project ref from URL
  const urlParts = supabaseUrl.split('.');
  const projectRef = urlParts[0].replace('https://', '');
  
  return `https://${projectRef}.supabase.co/functions/v1/${functionName}`;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: number;
          title: string;
          slug: string;
          description: string;
          thumbnail_url: string;
          category_id: number;
          is_premium: boolean;
          price: number | null;
          game_data: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          slug: string;
          description: string;
          thumbnail_url: string;
          category_id: number;
          is_premium?: boolean;
          price?: number | null;
          game_data: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          slug?: string;
          description?: string;
          thumbnail_url?: string;
          category_id?: number;
          is_premium?: boolean;
          price?: number | null;
          game_data?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: number;
          user_id: string;
          game_id: number;
          purchase_date: string;
          amount_paid: number;
        };
        Insert: {
          id?: number;
          user_id: string;
          game_id: number;
          purchase_date?: string;
          amount_paid: number;
        };
        Update: {
          id?: number;
          user_id?: string;
          game_id?: number;
          purchase_date?: string;
          amount_paid?: number;
        };
      };
    };
  };
}