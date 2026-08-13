import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

type RecoveryStatus = 'checking' | 'ready' | 'invalid';

function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const [status, setStatus] = useState<RecoveryStatus>('checking');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const markReady = () => active && setStatus('ready');
    const markInvalid = () => active && setStatus('invalid');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) markReady();
    });

    void supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        markInvalid();
        return;
      }

      // The SDK may exchange a PKCE recovery code before this page mounts.
      // In that case a valid recovery session is already available here.
      markReady();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      toast.error(t('passwordRecovery.errors.passwordTooShort'));
      return;
    }

    if (password !== confirmation) {
      toast.error(t('passwordRecovery.errors.passwordMismatch'));
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      toast.error(t('passwordRecovery.errors.generic'));
      return;
    }

    toast.success(t('passwordRecovery.success'));
    navigate({ to: '/admin/dashboard' });
  };

  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="text-primary size-8 animate-spin" aria-label={t('common:loading')} />
      </main>
    );
  }

  if (status === 'invalid') {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('passwordRecovery.invalidTitle')}</CardTitle>
            <CardDescription>{t('passwordRecovery.invalidDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: '/login' })}>
              {t('passwordRecovery.backToLogin')}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('passwordRecovery.title')}</CardTitle>
          <CardDescription>{t('passwordRecovery.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('passwordRecovery.newPassword')}</Label>
              <PasswordInput
                id="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('passwordRecovery.confirmPassword')}</Label>
              <PasswordInput
                id="confirm-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : t('passwordRecovery.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default ResetPasswordPage;
