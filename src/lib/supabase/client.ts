/**
 * Supabase Client
 * Client-side Supabase connection
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          telegram_id: number;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
          tax_mode: string;
          settings: Record<string, unknown>;
          is_pro: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          currency: string;
          category_id: string | null;
          counterparty: string | null;
          description: string | null;
          occurred_at: string;
          meta: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          type: 'income' | 'expense';
          is_default: boolean;
          color: string;
          icon: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      forecasts: {
        Row: {
          id: string;
          user_id: string;
          horizon_days: number;
          scenario: 'base' | 'optimistic' | 'pessimistic';
          income_series: Record<string, unknown>[];
          expense_series: Record<string, unknown>[];
          profit_series: Record<string, unknown>[];
          bands: Record<string, unknown>;
          quality: number;
          explanation: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['forecasts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['forecasts']['Insert']>;
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          kind: 'tax' | 'payment' | 'report' | 'custom';
          title: string;
          description: string | null;
          due_at: string;
          status: 'pending' | 'completed' | 'dismissed';
          payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>;
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          messages: Record<string, unknown>[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chats']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['chats']['Insert']>;
      };
    };
  };
};
