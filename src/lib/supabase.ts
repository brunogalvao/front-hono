import { createClient, type Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Configuration:', {
    url: supabaseUrl ? 'Defined' : 'Missing',
    anonKey: supabaseAnonKey ? 'Defined' : 'Missing',
  });
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
// Isso evita usar um token expirado do localStorage enquanto o refresh ainda não completou.
let _resolveReady!: () => void;
let _readyResolvedBy = 'pending';
const _sessionReady = new Promise<void>((resolve) => {
  _resolveReady = resolve;
});

supabase.auth.onAuthStateChange((event, session) => {
  _cachedSession = session;

  if (
    event === 'SIGNED_IN' ||
    event === 'TOKEN_REFRESHED' ||
    event === 'SIGNED_OUT' ||
    event === 'USER_UPDATED'
  ) {
    _readyResolvedBy = event;
    _resolveReady();
  } else if (event === 'INITIAL_SESSION') {
    if (!session) {
      _readyResolvedBy = 'INITIAL_SESSION(no session)';
      _resolveReady();
    } else {
      // Force a token refresh so the Supabase project is awake and the token
      // is server-validated before any API request is made.
      // TOKEN_REFRESHED (or SIGNED_OUT) will resolve _sessionReady.
      supabase.auth.refreshSession().catch(() => {
        // Network error or refresh token invalid — fall back to stored token.
        _readyResolvedBy = 'INITIAL_SESSION(refresh-failed-fallback)';
        _resolveReady();
      });
    }
  }
});

// Retorna um access_token garantidamente válido
export const getAuthToken = async (): Promise<string> => {
  await _sessionReady;

  const session = _cachedSession;
  if (!session?.access_token) throw new Error('Usuário não autenticado.');

  return session.access_token;
};
