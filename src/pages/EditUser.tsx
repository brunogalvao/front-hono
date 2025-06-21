import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/utils/getInitials";
import { uploadAvatarImage } from "@/service/uploadAvatarImage";

import { z } from "zod";
import { phoneSchema } from "@/model/phone.model";
import { PatternFormat } from "react-number-format";
import TituloPage from "@/components/TituloPage";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { RefreshCcw } from "@/components/animate-ui/icons/refresh-ccw";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

const EditUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState("");

  const { setProfile } = useUser();

  const schema = z.object({
    phone: phoneSchema,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const result = await supabase.auth.getUser();

      const user = result.data?.user;
      const prov = result.data.user?.app_metadata.provider;

      if (user) {
        setUser(user);
        setName(user.user_metadata?.displayName ?? "");
        setAvatarUrl(user.user_metadata?.avatar_url ?? "");
        setPhone(user.user_metadata?.phone ?? "");
        setProvider(prov || "desconhecido");
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setMessage("");

    const result = schema.safeParse({ phone });
    if (!result.success) {
      const errorMessage =
        result.error.format().phone?._errors?.[0] || "Telefone inválido.";
      setMessage(errorMessage);
      return;
    }

    const formattedPhone = result.data.phone;

    if (!user) {
      return setMessage("Usuário não autenticado.");
    }

    let newAvatarUrl = avatarUrl;

    try {
      if (file) {
        newAvatarUrl = await uploadAvatarImage(file, user.id);
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          displayName: name,
          phone: formattedPhone,
          avatar_url: newAvatarUrl,
        },
      });

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        return setMessage("Erro ao atualizar perfil.");
      }

      setAvatarUrl(newAvatarUrl);
      toast.success("Perfil atualizado com sucesso!", { duration: 5000 });

      // Atualiza no contexto global se for login por email
      if (provider === "email") {
        setProfile({
          name,
          email: user.email ?? "",
          avatar_url: newAvatarUrl,
          phone: formattedPhone,
          displayName: name,
        });
      }
    } catch (err) {
      console.error("Erro no processo de atualização:", err);
      setMessage("Erro ao fazer upload da foto.");
      toast.error(message, { duration: 5000 });
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      <TituloPage titulo="Editar Perfil" />

      <div className="flex flex-row items-center space-x-4">
        <Avatar className="w-20 h-20">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Avatar" />
          ) : (
            <AvatarFallback>
              {getInitials(name || user?.email || "")}
            </AvatarFallback>
          )}
        </Avatar>

        {provider === "email" && (
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div>Informações do Usuario</div>
            <div className="text-sm text-muted-foreground flex flex-row items-center gap-3">
              Está logado com
              {provider === "github" ? (
                <FaGithub className="size-6" />
              ) : provider === "google" ? (
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
              ) : (
                <IoMail className="size-6" />
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex space-y-6 flex-col">
          <div className="flex flex-row gap-6">
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                disabled={provider !== "email"}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <PatternFormat
                id="phone"
                value={phone}
                onValueChange={(values) => setPhone(values.formattedValue)}
                format="(##) #####-####"
                mask="_"
                customInput={Input}
              />
            </div>
          </div>

          <div className="flex flex-row gap-3 items-end">
            <div className="w-full flex gap-2 flex-col">
              <Label htmlFor="email">Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
          </div>

          {/* Reset Senha */}
          <div className="flex flex-row gap-3 items-end">
            <div className="w-full flex gap-2 flex-col">
              <Label htmlFor="email">Reset Senha</Label>
              <Input value={user?.email || ""} disabled />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <AnimateIcon animateOnHover>
            <LiquidButton className="text-white" onClick={handleUpdate}>
              <div className="px-12 flex flex-row items-center gap-3">
                Salvar Alterações
                <RefreshCcw className="size-5" />
              </div>
            </LiquidButton>
          </AnimateIcon>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditUser;
