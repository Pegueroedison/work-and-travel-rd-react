import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wmdyawtcfivzivaogktq.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZHlhd3RjZml2eml2YW9na3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTk0MTcsImV4cCI6MjA5NDY5NTQxN30.2aWanyCnpPiM08MjAt1DDKmM0YsmVtN-ulEfEvxXJOM';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'wt-guide-rd-auth-token',
        flowType: 'pkce',
      },
    })
  : null;

export async function getActiveSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session ?? null;
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  return supabase;
}
