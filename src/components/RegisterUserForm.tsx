import { useState } from 'react';
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
import { textoChamada } from '@/data/textoTitulo';

const RegisterUserForm = () => {
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
      console.log(errorMessages); // 👈 teste se esse log aparece

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
        emailRedirectTo: `${window.location.origin}/admin/list`,
      },
    });

    if (error) {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    } else if (data.user && data.user.identities?.length === 0) {
      // Email já cadastrado — Supabase retorna 200 mas sem enviar email (repeated signup)
      toast.error('Este e-mail já está cadastrado. Verifique sua caixa de entrada ou spam.');
    } else {
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail.');
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
        <CardTitle className="text-2xl">Faça seu Cadastro</CardTitle>
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
            <PasswordInput
              id="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
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
                  Cadastrando <Loader />
                </>
              ) : (
                <>
                  {' '}
                  Cadastrar <Send />
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
