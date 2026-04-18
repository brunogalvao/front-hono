import { createClient, type Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase configuration. Please check your .env file and ensure it contains:
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Cache da sessão — atualizado em todo evento de auth
let _cachedSession: Session | null = null;

// Promise que resolve SOMENTE quando temos certeza que a sessão é válida
// (SIGNED_IN ou TOKEN_REFRESHED) ou que não há sessão (SIGNED_OUT / INITIAL_SESSION sem sessão).
let _resolveReady!: () => void;
const _sessionReady = new Promise<void>((resolve) => {
  _resolveReady = resolve;
});

supabase.auth.onAuthStateChange((_event, session) => {
  _cachedSession = session;
  _resolveReady();
});

// Retorna um access_token garantidamente válido
export const getAuthToken = async (): Promise<string> => {
  await _sessionReady;

  const session = _cachedSession;
  if (!session?.access_token) throw new Error('Usuário não autenticado.');

  return session.access_token;
};
