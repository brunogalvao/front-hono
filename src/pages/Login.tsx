import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Github } from "lucide-react";
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

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
      if (user) navigate("/admin");
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
          redirectTo: `${window.location.origin}/admin`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await handleEmailLogin();
  };

  return (
    <div className="grid grid-cols-2">
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Bem vindo, faça o seu cadastro ou login.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-3">
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Carregando..." : "Entrar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleGithubLogin}
              >
                <Github /> Entrar com GitHub
              </Button>
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
          <h1 className="text-primary text-3xl font-bold">
            Texto para introdução
          </h1>
          <p className="text-zinc-400">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry...
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
