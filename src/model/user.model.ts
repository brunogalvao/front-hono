import type { WorkspaceRole } from '@/model/workspace.model';

/** Perfil do usuário logado (contexto de sessão) */
export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  displayName: string;
}

/** Perfil de usuário do banco de dados (tabela profiles) */
export interface AppUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AppUser {
  profile: AppUserProfile;
  role: WorkspaceRole | null;
  memberId: string | null;
}
