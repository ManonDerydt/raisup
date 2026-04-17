import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const isSupabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') && !import.meta.env.VITE_SUPABASE_URL.includes('VOTRE');

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Startup {
  id: string;
  user_id: string;
  name: string;
  sector: string;
  stage: 'pre-seed' | 'seed' | 'series-a';
  funding_amount: string;
  description: string;
  revenue: string;
  employees: number;
  problem: string;
  solution: string;
  target_market: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  startup_id: string;
  type: 'pitch_deck' | 'business_plan' | 'executive_summary';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  content: Record<string, unknown> | null;
  pages: number;
  created_at: string;
  updated_at: string;
}
