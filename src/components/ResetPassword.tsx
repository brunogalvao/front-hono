import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { KeyRound, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordInput } from './ui/password-input';

type PasswordStrength = {
  score: number; // 0–4
  label: string;
  color: string;
};

function getStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Fraca', color: 'bg-red-500' },
    { score: 2, label: 'Razoável', color: 'bg-amber-500' },
    { score: 3, label: 'Boa', color: 'bg-yellow-400' },
    { score: 4, label: 'Forte', color: 'bg-emerald-500' },
  ];

  return { ...levels[score], score };
}


export function ResetPassword({ provider }: { provider: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const strength = getStrength(form.newPass);
  const passwordsMatch = form.confirm.length > 0 && form.newPass === form.confirm;
  const passwordsMismatch = form.confirm.length > 0 && form.newPass !== form.confirm;

  const handleSubmit = async () => {
    if (!form.current) return toast.error('Informe sua senha atual.');
    if (form.newPass.length < 6) return toast.error('A nova senha deve ter no mínimo 6 caracteres.');
    if (form.newPass !== form.confirm) return toast.error('As senhas não coincidem.');

    setLoading(true);

    // Re-authenticate with current password
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;

    if (!email) {
      setLoading(false);
      return toast.error('Usuário não encontrado.');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: form.current,
    });

    if (signInError) {
      setLoading(false);
      return toast.error('Senha atual incorreta.');
    }

    const { error } = await supabase.auth.updateUser({ password: form.newPass });

    setLoading(false);

    if (error) return toast.error('Erro ao atualizar a senha.');

    toast.success('Senha atualizada com sucesso!');
    setForm({ current: '', newPass: '', confirm: '' });
    setOpen(false);
  };

  if (provider !== 'email') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <KeyRound className="size-4" />
          Alterar senha
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm" aria-describedby="reset-password-desc">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription id="reset-password-desc">
            Informe sua senha atual para confirmar a identidade antes de definir uma nova.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Senha atual */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="current">Senha atual</Label>
            <PasswordInput
              id="current"
              value={form.current}
              onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          {/* Nova senha */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPass">Nova senha</Label>
            <PasswordInput
              id="newPass"
              value={form.newPass}
              onChange={(e) => setForm((p) => ({ ...p, newPass: e.target.value }))}
              placeholder="••••••••"
            />

            {/* Strength bar */}
            {form.newPass.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors duration-300',
                        i <= strength.score ? strength.color : 'bg-muted',
                      )}
                    />
                  ))}
                </div>
                <p className={cn('text-xs', strength.score <= 1 ? 'text-red-500' : strength.score === 2 ? 'text-amber-500' : strength.score === 3 ? 'text-yellow-500' : 'text-emerald-500')}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <PasswordInput
              id="confirm"
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••"
            />
            {passwordsMatch && (
              <p className="text-xs text-emerald-500">Senhas coincidem ✓</p>
            )}
            {passwordsMismatch && (
              <p className="text-xs text-red-500">Senhas não coincidem</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                Salvando <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              'Salvar senha'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
