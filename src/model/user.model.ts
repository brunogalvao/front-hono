import type {
  PermissionResource,
  WorkspaceRole,
} from '@/model/workspace.model';

export interface PermissionAccessSummary {
  readableResources: PermissionResource[];
  writableResources: PermissionResource[];
  overrideCount: number;
}

/** Perfil do usuário logado (contexto de sessão) */
export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  displayName: string;
}

export type PlanTier = 'free' | 'pro';
export type SignupOrigin = 'self_signup' | 'workspace_invite';

/** Perfil de usuário do banco de dados (tabela profiles) */
export interface AppUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  email_normalized?: string;
  signup_origin?: SignupOrigin;
  onboarding_status?: 'incomplete' | 'complete';
  onboarding_completed_at?: string | null;
  plan_tier?: PlanTier;
  is_platform_superuser?: boolean;
  max_workspaces?: number;
}

export interface ProfileOnboardingUpdate {
  full_name: string;
  onboarding_status: 'complete';
  onboarding_completed_at: string;
}

export interface AppUser {
  profile: AppUserProfile;
  role: WorkspaceRole | null;
  memberId: string | null;
  access?: PermissionAccessSummary;
}
