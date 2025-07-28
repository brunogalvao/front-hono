import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { GradientText } from "@/components/animate-ui/text/gradient";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Loader } from "@/components/animate-ui/icons/loader";
import { textoChamada } from "@/data/textoTitulo";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/radix/tabs";
import RegisterUserForm from "@/components/RegisterUserForm";
import { AnimatePresence, motion } from "framer-motion";

interface FormData {
  name: string;
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [textoAtual, setTextoAtual] = useState<string>(
    textoChamada[0].textoHeader,
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

      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login com GitHub",
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login com Google",
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
        navigate({ to: "/admin/dashboard" });
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="grid md:grid-cols-2 grid-cols-1">
      <div className="md:min-h-screen h-auto py-8 md:p-0 flex items-center justify-center md:order-1 order-last">
        <Tabs defaultValue="login" className="md:w-[72%] w-[90%]">
          <Card className="bg-transparent border-none">
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
                    className="w-full flex items-center gap-2 py-6 cursor-pointer"
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
                    className="w-full flex items-center gap-2 py-6 cursor-pointer"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          className="w-5 h-5"
                        />
                        Acessando com Google...
                      </>
                    ) : (
                      <>
                        <img
                          src="https://www.svgrepo.com/show/475656/google-color.svg"
                          className="w-5 h-5"
                        />
                        Entrar com Google
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 border rounded-xl p-6">
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
                      className="w-full py-6 cursor-pointer"
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
              <div className="flex justify-between w-full text-primary">
                <Link to="/" className="text-sm hover:border-b border-dashed">
                  voltar
                </Link>
              </div>
            </CardFooter>
          </Card>
        </Tabs>
      </div>

      <div className="md:h-screen h-auto md:pt-8 py-8 flex items-center border-l border-dashed px-4 md:order-2">
        <div className="flex flex-col space-y-2 md:px-10 px-2">
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
                  className="text-5xl font-bold mb-3 capitalize"
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
