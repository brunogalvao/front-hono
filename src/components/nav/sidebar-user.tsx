import { useEffect, useState } from "react";
import { getUser } from "@/service/userService";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { UserProfile } from "@/model/user.model";

export function SidebarUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getUser();
        setProfile(userData);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };
    load();
  }, []);

  if (!profile) return null;

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-t">
      <Avatar>
        <AvatarImage src={profile.avatar_url} />
        <AvatarFallback>{profile.name?.[0] || "U"}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-sm truncate">{profile.name}</span>
    </div>
  );
}
