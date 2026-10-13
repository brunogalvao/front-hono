interface SupabaseErrorLike {
  code?: string;
  message?: string;
}

export function isMissingAuditRelation(error: SupabaseErrorLike | null) {
  return error?.code === 'PGRST200';
}
