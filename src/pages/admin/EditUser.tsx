import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/getInitials';
import { uploadAvatarImage } from '@/service/uploadAvatarImage';
import { Camera, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

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
import { useUser } from '@/hooks/useUser';
import { ResetPassword } from '@/components/ResetPassword';

const EditUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatarUrl: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [provider, setProvider] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setFormData({
          name: user.user_metadata?.displayName ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
          avatarUrl: user.user_metadata?.avatar_url ?? '',
          phone: user.user_metadata?.phone ?? '',
        });
        setProvider(prov || 'desconhecido');
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    const result = schema.safeParse({ phone: formData.phone });
    if (!result.success) {
      const errorMessage =
        result.error.format().phone?._errors?.[0] || 'Telefone inválido.';
      toast.error(errorMessage);
      return;
    }

    const formattedPhone = result.data.phone;

    if (!user) {
      toast.error('Usuário não autenticado.');
      return;
    }

    let newAvatarUrl = formData.avatarUrl;

    try {
      setUploading(true);
      if (file) {
        newAvatarUrl = await uploadAvatarImage(file, user.id);
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          displayName: formData.name,
          phone: formattedPhone,
          avatar_url: newAvatarUrl,
        },
      });

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil.');
        return;
      }

      setFormData((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
      setPreview(null);
      setFile(null);
      toast.success('Perfil atualizado com sucesso!', { duration: 5000 });

      if (provider === 'email') {
        setProfile({
          name: formData.name,
          email: user.email ?? '',
          avatar_url: newAvatarUrl,
          phone: formattedPhone,
          displayName: formData.name,
        });
      }
    } catch (err) {
      console.error('Erro no processo de atualização:', err);
      toast.error('Erro ao fazer upload da foto.', { duration: 5000 });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      setCropSrc(URL.createObjectURL(selected));
    }
    e.target.value = '';
  };

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedBlob = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<Blob> => {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      img,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      }, 'image/jpeg');
    });
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    const blob = await getCroppedBlob(cropSrc, croppedAreaPixels);
    const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    setFile(croppedFile);
    setPreview(URL.createObjectURL(blob));
    setCropSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <div className="mx-auto w-full space-y-6">
      <TituloPage titulo="Editar Perfil" />

      <div className="flex flex-row items-center gap-5">
        {/* Avatar clicável */}
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={preview ?? formData.avatarUrl} alt="Avatar" />
            <AvatarFallback className="text-lg">
              {getInitials(formData.name || user?.email || '')}
            </AvatarFallback>
          </Avatar>

          {provider === 'email' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
              title="Alterar foto"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Info do arquivo selecionado */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {formData.name || user?.email || 'Usuário'}
          </p>
          <p className="text-muted-foreground text-xs">{user?.email}</p>
          {preview && (
            <p className="text-xs text-amber-500">
              Nova foto selecionada — salve para aplicar.
            </p>
          )}
          {provider === 'email' && !preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-primary mt-1 w-fit text-xs underline underline-offset-2 transition-colors"
            >
              Alterar foto de perfil
            </button>
          )}
        </div>
      </div>

      {/* Crop Dialog */}
      <Dialog open={!!cropSrc} onOpenChange={(open) => { if (!open) { setCropSrc(null); setZoom(1); setCrop({ x: 0, y: 0 }); } }}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Recortar foto</DialogTitle>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-black">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="flex flex-col gap-2 px-1">
            <Label className="text-muted-foreground text-xs">Zoom</Label>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={([val]) => setZoom(val)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCropSrc(null); setZoom(1); setCrop({ x: 0, y: 0 }); }}>
              Cancelar
            </Button>
            <Button onClick={handleCropConfirm}>
              Aplicar recorte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome"
                disabled={provider !== 'email'}
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <PatternFormat
                id="phone"
                value={formData.phone}
                onValueChange={(values) => setFormData((prev) => ({ ...prev, phone: values.formattedValue }))}
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

          <ResetPassword provider={provider} />
        </CardContent>

        <CardFooter className="flex justify-end">
          <AnimateIcon animateOnHover>
            <LiquidButton className="text-white" onClick={handleUpdate} disabled={uploading}>
              <div className="flex flex-row items-center gap-3 px-12">
                {uploading ? (
                  <>
                    Salvando
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Salvar Alterações
                    <RefreshCcw className="size-5" />
                  </>
                )}
              </div>
            </LiquidButton>
          </AnimateIcon>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditUser;
