import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/config/api";
import type { UserProfile } from "@/model/user.model";

// ✅ GET USER com displayName corretamente
export const getUser = async (): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error("Usuário não encontrado");

  const { email, user_metadata } = data.user;

  return {
    email: email || "",
    phone: user_metadata?.phone || "",
    name: user_metadata?.name || user_metadata?.displayName || "",
    avatar_url: user_metadata?.avatar_url || "",
    displayName: user_metadata?.displayName || "",
  };
};

// ✅ PATCH para atualizar user no back-end
export const updateUser = async (
  data: UserProfile
): Promise<{ success: boolean; user: UserProfile }> => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  const token = sessionData?.session?.access_token;

  if (sessionError || !token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  const res = await fetch(`${API_BASE_URL}/api/user`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({
      error: "Erro desconhecido no servidor",
    }));
    throw new Error(error || "Erro ao atualizar perfil");
  }

  const result = await res.json();

  return {
    success: result.success,
    user: {
      email: result.user.email || "",
      name:
        result.user.user_metadata?.name ||
        result.user.user_metadata?.displayName ||
        "",
      displayName: result.user.user_metadata?.displayName || "",
      phone: result.user.user_metadata?.phone || "",
      avatar_url: result.user.user_metadata?.avatar_url || "",
    },
  };
};
