import { useEffect, useState } from "react";
import { getUser } from "@/service/userService";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/utils/getInitials";
import type { UserProfile } from "@/model/user.model";
import { useUser } from "@/context/UserContext";

export function SidebarUser() {
  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(
    null
  );
  const { profile } = useUser();

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getUser();
        setFetchedProfile(userData);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };

    load();
  }, []);

  const fullProfile = profile || fetchedProfile;
  if (!fullProfile) return null;

  const nameOrEmail =
    fullProfile.displayName || fullProfile.name || fullProfile.email;

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-t">
      <Avatar>
        <AvatarImage src={fullProfile.avatar_url} />
        <AvatarFallback>{getInitials(nameOrEmail)}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-sm truncate">{nameOrEmail}</span>
    </div>
  );
}
