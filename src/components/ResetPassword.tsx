import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

type StrengthKey = 'weak' | 'fair' | 'good' | 'strong' | '';

type PasswordStrength = {
  score: number;
  key: StrengthKey;
  color: string;
};

function getStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, key: '', color: '' },
    { score: 1, key: 'weak', color: 'bg-red-500' },
    { score: 2, key: 'fair', color: 'bg-amber-500' },
    { score: 3, key: 'good', color: 'bg-yellow-400' },
    { score: 4, key: 'strong', color: 'bg-emerald-500' },
  ];

  return { ...levels[score], score };
}

export function ResetPassword({ provider }: { provider: string }) {
  const { t } = useTranslation(['auth', 'common']);
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
    if (!form.current) return toast.error(t('resetPassword.errors.currentPasswordRequired'));
    if (form.newPass.length < 6) return toast.error(t('resetPassword.errors.passwordTooShort'));
    if (form.newPass !== form.confirm) return toast.error(t('resetPassword.errors.passwordMismatch'));

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;

    if (!email) {
      setLoading(false);
      return toast.error(t('resetPassword.errors.userNotFound'));
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: form.current,
    });

    if (signInError) {
      setLoading(false);
      return toast.error(t('resetPassword.errors.wrongPassword'));
    }

    const { error } = await supabase.auth.updateUser({ password: form.newPass });

    setLoading(false);

    if (error) return toast.error(t('resetPassword.errors.generic'));

    toast.success(t('resetPassword.success'));
    setForm({ current: '', newPass: '', confirm: '' });
    setOpen(false);
  };

  if (provider !== 'email') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <KeyRound className="size-4" />
          {t('resetPassword.trigger')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm" aria-describedby="reset-password-desc">
        <DialogHeader>
          <DialogTitle>{t('resetPassword.title')}</DialogTitle>
          <DialogDescription id="reset-password-desc">
            {t('resetPassword.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current">{t('resetPassword.currentPassword')}</Label>
            <PasswordInput
              id="current"
              value={form.current}
              onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPass">{t('resetPassword.newPassword')}</Label>
            <PasswordInput
              id="newPass"
              value={form.newPass}
              onChange={(e) => setForm((p) => ({ ...p, newPass: e.target.value }))}
              placeholder="••••••••"
            />

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
                {strength.key && (
                  <p className={cn('text-xs', strength.score <= 1 ? 'text-red-500' : strength.score === 2 ? 'text-amber-500' : strength.score === 3 ? 'text-yellow-500' : 'text-emerald-500')}>
                    {t(`resetPassword.strength.${strength.key}`)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">{t('resetPassword.confirmPassword')}</Label>
            <PasswordInput
              id="confirm"
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••"
            />
            {passwordsMatch && (
              <p className="text-xs text-emerald-500">{t('resetPassword.passwordsMatch')}</p>
            )}
            {passwordsMismatch && (
              <p className="text-xs text-red-500">{t('resetPassword.passwordsMismatch')}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            {t('common:cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                {t('resetPassword.saving')} <Loader2 className="size-4 animate-spin" />
              </>
            ) : (
              t('resetPassword.submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
