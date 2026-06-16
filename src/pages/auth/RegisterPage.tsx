import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation, Trans } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdConsent) {
      toast.error(t('register.errors.lgpdRequired'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            lgpd_consent: true,
          },
        },
      });
      if (error) throw error;
      toast.success(t('register.created'));
      navigate({ to: '/login' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('register.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('register.title')}</CardTitle>
          <CardDescription>{t('register.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('register.fullName')}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('register.fullNamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.emailPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('register.passwordPlaceholder')}
                minLength={8}
                required
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="lgpd"
                checked={lgpdConsent}
                onCheckedChange={(v) => setLgpdConsent(!!v)}
              />
              <Label htmlFor="lgpd" className="text-sm leading-tight cursor-pointer">
                <Trans
                  ns="auth"
                  i18nKey="register.lgpd"
                  components={{ highlight: <span className="text-primary underline" /> }}
                />
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !lgpdConsent}>
              {loading ? t('register.creating') : t('register.create')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('register.alreadyHaveAccount')}{' '}
              <a href="/login" className="text-primary underline">
                {t('register.signIn')}
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
