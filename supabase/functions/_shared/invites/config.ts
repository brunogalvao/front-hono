export type InviteLocale = 'pt-BR' | 'en';

export interface InviteConfig {
  siteUrl: URL;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  resendApiKey: string;
  fromEmail: string;
  rateLimits: {
    actorWorkspacePerHour: number;
    recipientWorkspacePerHour: number;
    sourcePerHour: number;
  };
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`missing_config:${name}`);
  return value;
}

function positiveIntegerEnv(name: string, fallback: number): number {
  const raw = Deno.env.get(name)?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`invalid_config:${name}`);
  return value;
}

function validatedSiteUrl(): URL {
  const siteUrl = new URL(requiredEnv('SITE_URL'));
  const isLocal = siteUrl.hostname === '127.0.0.1' || siteUrl.hostname === 'localhost';
  const environment = Deno.env.get('ENVIRONMENT')?.toLowerCase();

  if (siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
    throw new Error('invalid_config:SITE_URL');
  }
  if (!isLocal && siteUrl.protocol !== 'https:') throw new Error('invalid_config:SITE_URL');
  if (environment === 'production' && isLocal) throw new Error('invalid_config:SITE_URL');

  siteUrl.pathname = siteUrl.pathname.replace(/\/$/, '');
  return siteUrl;
}

export function loadInviteConfig(): InviteConfig {
  return {
    siteUrl: validatedSiteUrl(),
    supabaseUrl: requiredEnv('SUPABASE_URL'),
    supabaseAnonKey: requiredEnv('SUPABASE_ANON_KEY'),
    supabaseServiceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    resendApiKey: requiredEnv('RESEND_API_KEY'),
    fromEmail: requiredEnv('FROM_EMAIL'),
    rateLimits: {
      actorWorkspacePerHour: positiveIntegerEnv('INVITE_RATE_LIMIT_ACTOR_WORKSPACE_PER_HOUR', 10),
      recipientWorkspacePerHour: positiveIntegerEnv('INVITE_RATE_LIMIT_RECIPIENT_WORKSPACE_PER_HOUR', 3),
      sourcePerHour: positiveIntegerEnv('INVITE_RATE_LIMIT_SOURCE_PER_HOUR', 30),
    },
  };
}

export function inviteLandingUrl(siteUrl: URL, rawToken: string): URL {
  const target = new URL('/auth/workspace-invite', siteUrl);
  target.searchParams.set('token', rawToken);
  return target;
}

export function inviteCallbackUrl(siteUrl: URL): URL {
  const target = new URL('/auth/callback', siteUrl);
  target.searchParams.set('flow', 'workspace-invite');
  return target;
}

export function isInviteLocale(value: unknown): value is InviteLocale {
  return value === 'pt-BR' || value === 'en';
}
