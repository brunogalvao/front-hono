import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaGithub } from "react-icons/fa";
import { GradientText } from "@/components/animate-ui/text/gradient";
import { useLocation } from "react-router-dom";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LogIn } from "@/components/animate-ui/icons/log-in";
import { Loader } from "@/components/animate-ui/icons/loader";

interface FormData {
  name: string;
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const textoHeader = location.state?.textoHeader;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            displayName: formData.name, // <-- Certifique-se de ter o nome aqui
          },
        });
      }

      navigate("/admin/list");
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
          redirectTo: `${window.location.origin}/admin/list`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login com GitHub"
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
          redirectTo: `${window.location.origin}/admin/list`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login com Google"
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await handleEmailLogin();
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin/list");
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="grid grid-cols-2">
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[72%]">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Bem vindo, faça o seu cadastro ou login.
            </CardDescription>
          </CardHeader>

          <CardContent>
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
          </CardContent>

          <CardFooter>
            <div className="flex justify-between w-full text-primary">
              <Link to="/" className="text-sm hover:border-b border-dashed">
                voltar
              </Link>
              <Link
                to="/register"
                className="text-sm hover:border-b border-dashed"
              >
                cadastro
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="h-screen flex items-center border-l border-dashed px-4">
        <div className="flex flex-col space-y-2 px-10">
          <GradientText
            className="text-5xl font-bold mb-3"
            text="Task's Finance"
          />
          <p className="text-zinc-400">
            {textoHeader ?? "Texto para introdução"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
