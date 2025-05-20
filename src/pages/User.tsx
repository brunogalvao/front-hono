import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TituloPage from "@/components/TituloPage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/Loading";

const User = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;

      const { email, user_metadata } = data.user;
      setUser(data.user);
      setEmail(email || "");
      setName(user_metadata?.name || "");
      setAvatarUrl(user_metadata?.avatar_url || "");

      // salva o original para comparação
      setOriginalProfile({
        email,
        name: user_metadata?.name || "",
        avatar_url: user_metadata?.avatar_url || "",
      });
    };

    loadUser();
  }, []);

  const hasChanges = () => {
    if (!originalProfile) return false;
    return (
      email !== originalProfile.email ||
      name !== originalProfile.name ||
      avatarUrl !== originalProfile.avatar_url
    );
  };

  const handleSave = async () => {
    const updates = {
      email,
      data: {
        name,
        avatar_url: avatarUrl,
      },
    };

    const { error } = await supabase.auth.updateUser(updates);
    setMessage(error ? error.message : "Atualizado com sucesso.");
    if (!error) {
      setOriginalProfile({ email, name, avatar_url: avatarUrl });
    }
  };

  if (!user) return <Loading />;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Usuário" />

      <div className="flex flex-row items-center gap-3">
        <Avatar className="w-14 h-14">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span>{user.user_metadata?.full_name}</span>
      </div>

      {!user.user_metadata?.full_name && (
        <div className="space-y-3">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}

      <div className="space-y-3">
        <Label>Email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-3">
        <Label>Avatar (URL)</Label>
        <Input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>

      {hasChanges() && (
        <Button onClick={handleSave} className="mt-4">
          Salvar Alterações
        </Button>
      )}

      {message && (
        <div className="text-sm text-muted-foreground">{message}</div>
      )}
    </div>
  );
};

export default User;
