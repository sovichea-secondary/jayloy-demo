import { createClient } from '@supabase/supabase-js';

// Note: These would normally come from environment variables
// For demo purposes, we'll use placeholder values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          vendor: string;
          amount: number;
          date: string;
          description: string;
          tax: number;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor: string;
          amount: number;
          date: string;
          description: string;
          tax: number;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor?: string;
          amount?: number;
          date?: string;
          description?: string;
          tax?: number;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
};