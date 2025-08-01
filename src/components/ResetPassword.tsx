import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { LiquidButton } from '@/components/animate-ui/buttons/liquid';

export function ResetPassword({ provider }: { provider: string }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return toast.error('Preencha os dois campos de senha.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('As senhas não coincidem.');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return toast.error('Erro ao redefinir a senha.');
    }

    toast.success('Senha atualizada com sucesso!');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (provider !== 'email') return null;

  return (
    <div className="w-full space-y-2 rounded-sm rounded-t-none border border-zinc-800 bg-zinc-950 p-4">
      <Label>Nova senha</Label>
      <Input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Nova senha"
      />

      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirmar nova senha"
      />

      <div className="flex justify-end gap-3">
        <LiquidButton className="text-white" onClick={handleResetPassword}>
          <div className="flex flex-row items-center gap-3 px-12">
            Confirmar nova senha
          </div>
        </LiquidButton>
      </div>
    </div>
  );
}
