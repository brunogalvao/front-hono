import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/getInitials';
import { uploadAvatarImage } from '@/service/uploadAvatarImage';

import { z } from 'zod';
import { phoneSchema } from '@/model/phone.model';
import { PatternFormat } from 'react-number-format';
import TituloPage from '@/components/TituloPage';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FaGithub } from 'react-icons/fa';
import { IoMail } from 'react-icons/io5';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LiquidButton } from '@/components/animate-ui/buttons/liquid';
import { RefreshCcw } from '@/components/animate-ui/icons/refresh-ccw';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { ResetPassword } from '@/components/ResetPassword';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@/components/animate-ui/base/accordion';

const EditUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState('');

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
        setName(user.user_metadata?.displayName ?? '');
        setAvatarUrl(user.user_metadata?.avatar_url ?? '');
        setPhone(user.user_metadata?.phone ?? '');
        setProvider(prov || 'desconhecido');
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setMessage('');

    const result = schema.safeParse({ phone });
    if (!result.success) {
      const errorMessage =
        result.error.format().phone?._errors?.[0] || 'Telefone inválido.';
      setMessage(errorMessage);
      return;
    }

    const formattedPhone = result.data.phone;

    if (!user) {
      return setMessage('Usuário não autenticado.');
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
        console.error('Erro ao atualizar perfil:', error);
        return setMessage('Erro ao atualizar perfil.');
      }

      setAvatarUrl(newAvatarUrl);
      toast.success('Perfil atualizado com sucesso!', { duration: 5000 });

      // Atualiza no contexto global se for login por email
      if (provider === 'email') {
        setProfile({
          name,
          email: user.email ?? '',
          avatar_url: newAvatarUrl,
          phone: formattedPhone,
          displayName: name,
        });
      }
    } catch (err) {
      console.error('Erro no processo de atualização:', err);
      setMessage('Erro ao fazer upload da foto.');
      toast.error(message, { duration: 5000 });
    }
  };

  const [checked, setChecked] = useState(false);

  return (
    <div className="mx-auto w-full space-y-6">
      <TituloPage titulo="Editar Perfil" />

      <div className="flex flex-row items-center space-x-4">
        <Avatar className="h-20 w-20">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Avatar" />
          ) : (
            <AvatarFallback>
              {getInitials(name || user?.email || '')}
            </AvatarFallback>
          )}
        </Avatar>

        {provider === 'email' && (
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>Informações do Usuario</div>
            <div className="text-muted-foreground flex flex-row items-center gap-3 text-sm">
              Está logado com
              {provider === 'github' ? (
                <FaGithub className="size-6" />
              ) : provider === 'google' ? (
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="h-5 w-5"
                />
              ) : (
                <IoMail className="size-6" />
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col space-y-6">
          <div className="flex flex-row gap-6">
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                disabled={provider !== 'email'}
              />
            </div>

            <div className="flex w-full flex-col gap-2">
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

          <div className="flex flex-row items-end gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
          </div>

          <div className="flex flex-1 flex-row">
            <Accordion className="w-full">
              <AccordionItem className="mb-2 w-full border-0">
                <AccordionTrigger
                  onClick={() => setChecked(!checked)}
                  className={`bg-accent hover:bg-primary rounded px-3 decoration-0 transition duration-300 ${
                    checked ? 'bg-primary rounded-b-none text-white' : ''
                  }`}
                >
                  {checked ? 'Troque sua senha.' : 'Quer resetar a Senha ?'}
                </AccordionTrigger>
                <AccordionPanel>
                  {checked && <ResetPassword provider={provider} />}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <AnimateIcon animateOnHover>
            <LiquidButton className="text-white" onClick={handleUpdate}>
              <div className="flex flex-row items-center gap-3 px-12">
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
