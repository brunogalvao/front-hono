import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FaGithub } from 'react-icons/fa';
import { GradientText } from '@/components/animate-ui/text/gradient';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LogIn } from '@/components/animate-ui/icons/log-in';
import { Loader } from '@/components/animate-ui/icons/loader';
import { textoChamada } from '@/data/textoTitulo';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/radix/tabs';
import RegisterUserForm from '@/components/RegisterUserForm';
import { AnimatePresence, motion } from 'framer-motion';

interface FormData {
  name: string;
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [textoAtual, setTextoAtual] = useState<string>(
    textoChamada[0].textoHeader
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      const {
        error,
        data: { user },
      } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // ⚠️ Atualiza o displayName se estiver vazio
      if (user && !user.user_metadata?.displayName) {
        await supabase.auth.updateUser({
          data: {
            displayName: formData.name,
          },
        });
      }

      navigate({ to: '/admin/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
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
          redirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao fazer login com GitHub'
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
          redirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao fazer login com Google'
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
    setTextoAtual(textoChamada[0].subTituloCadastroCard);
  };

  const changeTextLogin = () => {
    setTextoAtual(textoChamada[0].textoHeader);
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
                        <FaGithub /> Acessando a aplicação
                      </>
                    ) : (
                      <>
                        <FaGithub /> Entrar com GitHub
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
                        Acessando com Google...
                      </>
                    ) : (
                      <>
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          className="h-5 w-5"
                        />
                        Entrar com Google
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
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
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
                          Carregando
                          <Loader />
                        </>
                      ) : (
                        <>
                          Entrar
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
                  voltar
                </Link>
              </div>
            </CardFooter>
          </Card>
        </Tabs>
      </div>

      <div className="flex h-auto items-center border-l border-dashed px-4 py-8 md:order-2 md:h-screen md:pt-8">
        <div className="flex flex-col space-y-2 px-2 md:px-10">
          {/* <p className="text-zinc-400 transition duration-200">{textoAtual}</p> */}

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
                  text={textoChamada[0].title}
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
