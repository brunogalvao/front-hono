import { supabase } from "@/lib/supabase";

export const uploadAvatarImage = async (file: File, userId: string) => {
  const fileName = `${userId}-${Date.now()}.${file.name.split(".").pop()}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type,
    });

  if (error) {
    console.error("Erro ao fazer upload do avatar:", error);
    throw error;
  }

  const publicUrl = supabase.storage.from("avatars").getPublicUrl(fileName)
    .data.publicUrl;

  return publicUrl;
};
