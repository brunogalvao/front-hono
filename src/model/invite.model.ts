import type { WorkspaceInfo, WorkspaceRole } from '@/model/workspace.model';

export const inviteLocales = ['pt-BR', 'en'] as const;
export type InviteLocale = (typeof inviteLocales)[number];

export const inviteRoles = [
  'administrador',
  'operador',
  'visualizador',
] as const;
export type InviteRole = Exclude<WorkspaceRole, 'super_administrador'>;

export type InviteLifecycleStatus =
  | 'pending'
  | 'accepted'
  | 'cancelled'
  | 'expired';
export type InviteDeliveryStatus = 'pending' | 'sent' | 'failed';
export type InvitePublicStatus =
  | 'sent'
  | 'delivery_failed'
  | 'already_member'
  | 'existing_pending_invite'
  | 'rate_limited';
export type InviteViewStatus =
  | 'valid'
  | 'invalid'
  | 'expired'
  | 'cancelled'
  | 'already_accepted'
  | 'email_mismatch'
  | 'failed';

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  invited_by: string;
  email_normalized: string;
  role: InviteRole;
  status: InviteLifecycleStatus;
  delivery_status: InviteDeliveryStatus;
  locale: InviteLocale;
  expires_at: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export type InviteMutationRequest =
  | {
      operation: 'create';
      workspace_id: string;
      email: string;
      role: InviteRole;
      locale: InviteLocale;
    }
  | { operation: 'resend'; invite_id: string; locale: InviteLocale };

export interface InviteMutationResult {
  status: InvitePublicStatus;
  invite_id?: string;
  expires_at?: string;
  retry_after?: number;
  error_code?: string;
}

export interface InvitePartySummary {
  display_name: string;
}

export interface InviteWorkspaceSummary {
  id: string;
  name: string;
}

export interface InvitePreview {
  status: 'valid';
  workspace: InviteWorkspaceSummary;
  inviter: InvitePartySummary;
  role: InviteRole;
  expires_at: string;
  profile_onboarding_status: 'incomplete' | 'complete';
}

export interface InviteAcceptanceResult {
  status: 'accepted' | 'already_member';
  workspace: InviteWorkspaceSummary;
  role: InviteRole;
  profile_onboarding_status: 'incomplete' | 'complete';
}

export interface InviteErrorResult {
  status: Exclude<InviteViewStatus, 'valid'>;
  error_code: string;
}

export type InviteFlowResult =
  | InvitePreview
  | InviteAcceptanceResult
  | InviteErrorResult;

/** @deprecated Compatibility type for the legacy /invite page until its route is replaced. */
export interface InviteInfo {
  email: string;
  group: Pick<WorkspaceInfo, 'id' | 'name'>;
  expires_at: string;
}
