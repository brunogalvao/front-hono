import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TituloPage from "@/components/TituloPage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/Loading";

import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { getUser, updateUser } from "@/service/userService";
import type { UserProfile } from "@/model/user.model";

const User = () => {
  const [profile, setProfile] = useState<UserProfile>();
  const [originalProfile, setOriginalProfile] = useState<UserProfile>();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getUser();
        setProfile(userData);
        setOriginalProfile(userData);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage("Erro ao carregar dados.");
      }
    };
    load();
  }, []);

  const hasChanges = () => {
    return (
      profile?.email !== originalProfile?.email ||
      profile?.name !== originalProfile?.name ||
      profile?.avatar_url !== originalProfile?.avatar_url ||
      profile?.phone !== originalProfile?.phone
    );
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { user } = await updateUser(profile);
      setOriginalProfile(user); // Corrigido aqui
      setMessage("Atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <Loading />;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Usuário" />
      <Card>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-row items-center gap-3">
              <Avatar className="w-14 h-14">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span>{profile.name}</span>
            </div>

            <div className="space-y-3">
              <Label>Nome</Label>
              <Input
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev!, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev!, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev!, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-3">
              <Label>Avatar URL</Label>
              <Input
                value={profile.avatar_url}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev!,
                    avatar_url: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {hasChanges() && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="" disabled={saving}>
            {saving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Salvando
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default User;
