import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

type ProfileSetup = {
  userId: string;
  fullName: string;
};

export function InvitePasswordSetupDialog() {
  const { t } = useTranslation('invite');
  const [profile, setProfile] = useState<ProfileSetup | null>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, password_setup_required')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (!active || profileError || !data?.password_setup_required) return;
      setProfile({
        userId: authData.user.id,
        fullName: data.full_name?.trim() ?? '',
      });
      setOpen(true);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    if (!profile) return;
    if (password.length < 8) {
      setError(t('passwordSetup.errors.tooShort'));
      return;
    }
    if (password !== passwordConfirmation) {
      setError(t('passwordSetup.errors.mismatch'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });
      if (passwordError) throw passwordError;

      const normalizedName = profile.fullName.trim();
      const profileUpdate = normalizedName
        ? {
            full_name: normalizedName,
            onboarding_status: 'complete',
            onboarding_completed_at: new Date().toISOString(),
            password_setup_required: false,
          }
        : { password_setup_required: false };
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', profile.userId);
      if (profileError) throw profileError;

      await queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      setOpen(false);
      toast.success(t('passwordSetup.success'));
    } catch {
      setError(t('passwordSetup.errors.generic'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="bg-primary/10 text-primary mb-1 flex size-10 items-center justify-center rounded-full">
            <KeyRound aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle>{t('passwordSetup.title')}</DialogTitle>
          <DialogDescription>
            {t('passwordSetup.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-profile-name">
              {t('passwordSetup.fullName')}
            </Label>
            <Input
              id="invite-profile-name"
              value={profile?.fullName ?? ''}
              onChange={(event) =>
                setProfile((current) =>
                  current
                    ? { ...current, fullName: event.target.value }
                    : current
                )
              }
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-new-password">
              {t('passwordSetup.password')}
            </Label>
            <PasswordInput
              id="invite-new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
            <p className="text-muted-foreground text-xs">
              {t('passwordSetup.passwordHint')}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-confirm-password">
              {t('passwordSetup.confirmPassword')}
            </Label>
            <PasswordInput
              id="invite-confirm-password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => setOpen(false)}
          >
            {t('passwordSetup.later')}
          </Button>
          <Button type="button" disabled={saving} onClick={save}>
            {saving && <Loader2 aria-hidden="true" className="animate-spin" />}
            {saving ? t('passwordSetup.saving') : t('passwordSetup.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
