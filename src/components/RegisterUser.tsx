import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RegisterUser = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // cria usuário se não existir
        emailRedirectTo: `${window.location.origin}/admin`, // onde será redirecionado após login
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Enviamos um link mágico para seu e-mail.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar com Magic Link</CardTitle>
          <CardDescription>
            Digite seu e-mail e receba um link de acesso.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleMagicLink}>
            {message && (
              <p className="text-green-600 text-sm bg-green-100 p-2 rounded">
                {message}
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm bg-red-100 p-2 rounded">
                {error}
              </p>
            )}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                placeholder="seu@email.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Magic Link"}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div className="flex justify-between w-full text-primary">
            <Link
              to="/login"
              className="text-sm hover:border-b hover:border-dashed"
            >
              Voltar
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterUser;
