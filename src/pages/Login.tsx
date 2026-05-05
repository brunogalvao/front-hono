import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FaGithub } from 'react-icons/fa';
import { GradientText } from '@/components/animate-ui/text/gradient';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LogIn } from '@/components/animate-ui/icons/log-in';
import { Loader } from '@/components/animate-ui/icons/loader';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/radix/tabs';
import RegisterUserForm from '@/components/RegisterUserForm';
import { ForgotPassword } from '@/components/ForgotPassword';
import { AnimatePresence, motion } from 'framer-motion';

interface FormData {
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'home', 'common']);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [textoTab, setTextoTab] = useState<'login' | 'register'>('login');
  const textoAtual = textoTab === 'login'
    ? t('home:hero.description')
    : t('home:register.prompt');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      navigate({ to: '/admin/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth:login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('auth:login.errors.github')
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('auth:login.errors.google')
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await handleEmailLogin();
  };

  const changeTextCadastro = () => {
    setTextoTab('register');
  };

  const changeTextLogin = () => {
    setTextoTab('login');
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: '/admin/dashboard' });
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="order-last flex h-auto items-center justify-center py-8 md:order-1 md:min-h-screen md:p-0">
        <Tabs defaultValue="login" className="w-[90%] md:w-[72%]">
          <Card className="border-none bg-transparent">
            <CardHeader>
              <TabsList className="w-full">
                <TabsTrigger
                  className="w-full"
                  value="login"
                  onPointerDown={changeTextLogin}
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  className="w-full"
                  value="sign-up"
                  onPointerDown={changeTextCadastro}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex w-full cursor-pointer items-center gap-2 py-6"
                    onClick={handleGithubLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FaGithub /> {t('auth:login.withGithubLoading')}
                      </>
                    ) : (
                      <>
                        <FaGithub /> {t('auth:login.withGithub')}
                      </>
                    )}
                  </Button>

                  <Separator className="my-4" />

                  <Button
                    type="button"
                    variant="outline"
                    className="flex w-full cursor-pointer items-center gap-2 py-6"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          className="h-5 w-5"
                        />
                        {t('auth:login.withGoogleLoading')}
                      </>
                    ) : (
                      <>
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          className="h-5 w-5"
                        />
                        {t('auth:login.withGoogle')}
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 rounded-xl border p-6">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="exemplo@email.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('auth:login.password')}</Label>
                        <ForgotPassword />
                      </div>
                      <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        required
                        placeholder="********"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <AnimateIcon animateOnHover>
                    <Button
                      type="submit"
                      className="w-full cursor-pointer py-6"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          {t('auth:login.loading')}
                          <Loader />
                        </>
                      ) : (
                        <>
                          {t('auth:login.submit')}
                          <LogIn className="size-5" />
                        </>
                      )}
                    </Button>
                  </AnimateIcon>
                </form>
              </TabsContent>
              <TabsContent value="sign-up">
                <RegisterUserForm />
              </TabsContent>
            </CardContent>
            <CardFooter>
              <div className="text-primary flex w-full justify-between">
                <Link to="/" className="border-dashed text-sm hover:border-b">
                  {t('common:back')}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </Tabs>
      </div>

      <div className="flex h-auto items-center border-l border-none px-4 py-8 md:order-2 md:h-screen md:border-dashed md:pt-8">
        <div className="flex flex-col space-y-2 px-2 md:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={textoAtual}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col space-y-2">
                <GradientText
                  className="mb-3 text-5xl font-bold capitalize"
                  text={t('home:hero.title')}
                />
                <span className="text-zinc-400">{textoAtual}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Login;
