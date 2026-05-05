import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { registerSchema } from '@/schema/registerSchema';
import { AnimateIcon } from './animate-ui/icons/icon';
import { Send } from './animate-ui/icons/send';
import { Loader } from './animate-ui/icons/loader';

const RegisterUserForm = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      const errorMessages = result.error.flatten().fieldErrors;

      // Pega a primeira mensagem de erro e exibe no toast
      const firstError = Object.values(errorMessages)[0]?.[0];
      if (firstError) toast.error(firstError);

      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          displayName: form.name,
        },
        emailRedirectTo: `${window.location.origin}/admin/expenses`,
      },
    });

    if (error) {
      toast.error(`${t('register.errors.generic')}: ${error.message}`);
    } else if (data.user && data.user.identities?.length === 0) {
      toast.error(t('register.errors.emailInUse'));
    } else {
      toast.success(t('register.success'));
      setForm({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
      });
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
        <CardDescription>
          {t('register.subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">{t('register.name')}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t('register.namePlaceholder')}
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">{t('register.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('register.emailPlaceholder')}
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">{t('register.password')}</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="********"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <AnimateIcon animateOnHover>
            <Button
              type="submit"
              className="flex w-full items-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  {t('common:loading')} <Loader />
                </>
              ) : (
                <>
                  {t('register.submit')} <Send />
                </>
              )}
            </Button>
          </AnimateIcon>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterUserForm;
