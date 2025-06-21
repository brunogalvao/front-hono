import { useState } from "react";
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
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { registerSchema } from "@/schema/registerSchema";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { Send } from "./animate-ui/icons/send";
import { Loader } from "./animate-ui/icons/loader";
import { GradientText } from "./animate-ui/text/gradient";
import { textoChamada } from "@/data/textoTitulo";

const RegisterUser = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
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
      console.log(errorMessages); // 👈 teste se esse log aparece

      // Pega a primeira mensagem de erro e exibe no toast
      const firstError = Object.values(errorMessages)[0]?.[0];
      if (firstError) toast.error(firstError);

      return;
    }

    setLoading(true);

    localStorage.setItem("signup_name", form.name);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          displayName: form.name,
        },
        emailRedirectTo: `${window.location.origin}/admin/list`,
      },
    });

    if (error) {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    } else {
      toast.success("Cadastro realizado com sucesso! Verifique seu e-mail.");
      setForm({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen items-center justify-center grid md:grid-cols-2 grid-cols-1">
      <div className="md:min-h-screen h-auto py-8 md:p-0 flex items-center justify-center md:order-1 order-last">
        <Card className="md:w-[72%] w-[90%]">
          <CardHeader>
            <CardTitle className="text-2xl">Cadastro</CardTitle>
            <CardDescription>
              {textoChamada[0].subTituloCadastroCard}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Preencha com o seu nome"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Preencha com o seu E-mail"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <AnimateIcon animateOnHover>
                <Button
                  type="submit"
                  className="w-full flex gap-3 items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      Cadastrando <Loader />
                    </>
                  ) : (
                    <>
                      {" "}
                      Cadastrar <Send />
                    </>
                  )}
                </Button>
              </AnimateIcon>
            </form>
          </CardContent>

          <CardFooter>
            <div className="flex justify-between w-full text-primary">
              <Link
                to="/login"
                className="text-sm hover:border-b border-dashed"
              >
                Voltar
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="md:h-screen h-auto md:pt-8 py-8 flex items-center border-l border-dashed px-4 md:order-2">
        <div className="flex flex-col space-y-2 md:px-10 px-2">
          <GradientText
            className="text-5xl font-bold mb-3 capitalize"
            text={textoChamada[0].title}
          />
          <p className="text-zinc-400">
            {textoChamada[0].textoAuxilioRegister}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
