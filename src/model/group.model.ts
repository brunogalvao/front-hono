export interface GroupAccess {
  access_expenses: boolean;
  access_incomes: boolean;
  access_installments: boolean;
  access_advisor: boolean;
}

export interface GroupItem {
  id: string;
  name: string;
  type: 'personal' | 'shared';
  owner_id: string;
  created_at: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface GroupMember extends GroupAccess {
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export interface GroupInvite extends GroupAccess {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface CreateGroupPayload {
  name: string;
  type: 'personal' | 'shared';
}

export interface InvitePayload extends GroupAccess {
  name: string;
  email: string;
  phone?: string;
}
