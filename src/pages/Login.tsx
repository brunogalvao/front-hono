import { Button } from "@/components/ui/button";
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
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      if (user) {
        navigate("/admin");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    try {
      setLoading(true);

      // Remove todos os caracteres não numéricos
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      
      // Valida o formato do número (DDD + 8 ou 9 dígitos)
      if (!/^[1-9][1-9]\d{8,9}$/.test(cleanedPhone)) {
        throw new Error(
          "Digite apenas os números: DDD + número (ex: 41991192588)",
        );
      }

      // Adiciona o prefixo +55 para o Supabase
      const formattedPhone = `+55${cleanedPhone}`;

      console.log("Debug - Número formatado:", formattedPhone);

      if (!showVerification) {
        console.log("Debug - Iniciando envio de OTP para:", formattedPhone);
        const response = await supabase.auth.signInWithOtp({
          phone: formattedPhone
        });

        console.log("Debug - Resposta completa do Supabase:", response);

        if (response.error) {
          console.error("Debug - Erro detalhado do Supabase:", {
            error: response.error,
            status: response.error.status,
            message: response.error.message,
          });
          throw response.error;
        }
        setShowVerification(true);
      } else {
        console.log("Debug - Verificando OTP:", {
          phone: formattedPhone,
          codeLength: verificationCode.length,
        });
        const response = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: verificationCode,
          type: "sms",
        });

        console.log("Debug - Resposta da verificação:", response);

        if (response.error) {
          console.error("Debug - Erro na verificação:", response.error);
          throw response.error;
        }
        if (response.data.user) {
          console.log("Debug - Login bem sucedido, redirecionando...");
          navigate("/admin");
        }
      }
    } catch (error) {
      console.error("Debug - Erro completo:", {
        error,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        type: error?.constructor?.name,
      });
      setError(error instanceof Error ? error.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isPhoneLogin) {
      await handlePhoneLogin();
    } else {
      await handleEmailLogin();
    }
  };

  return (
    <div className="grid grid-cols-2">
      {/* Login */}
      <div>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Bem vindo, faça o seu cadastro ou faça o login.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="max-w-md w-full">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  <div className="rounded-md shadow-sm space-y-3">
                    {isPhoneLogin ? (
                      <>
                        <div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="41991192588"
                              required
                              value={formData.phone}
                              onChange={handleChange}
                            />
                            <p className="text-sm text-gray-500">
                              Digite apenas os números: DDD + número (ex: 41991192588)
                            </p>
                          </div>
                        </div>
                        {showVerification && (
                          <div>
                            <div className="space-y-2">
                              <Label htmlFor="code">
                                Código de Verificação
                              </Label>
                              <Input
                                id="code"
                                type="text"
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) =>
                                  setVerificationCode(e.target.value)
                                }
                              />
                              <p className="text-sm text-gray-500">
                                Digite o código de 6 dígitos enviado por SMS
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  <div>
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading
                          ? "Carregando..."
                          : showVerification
                            ? "Verificar"
                            : "Entrar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsPhoneLogin(!isPhoneLogin);
                          setShowVerification(false);
                          setVerificationCode("");
                          setError("");
                        }}
                      >
                        {isPhoneLogin
                          ? "Entrar com Email"
                          : "Entrar com Telefone"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>

            <CardFooter>
              <div className="flex justify-between w-full text-primary">
                <Link
                  to="/"
                  className="text-sm hover:border-b hover:border-dashed"
                >
                  voltar
                </Link>
                <Link
                  to="/register"
                  className="text-sm hover:border-b hover:border-dashed"
                >
                  cadastro
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Texto introdução */}
      <div className="h-screen flex items-center border-l border-dashed px-4">
        <div className="flex flex-col space-y-2 px-10">
          <h1 className="text-primary text-3xl font-bold">
            Texto para introdução
          </h1>
          <p className="text-zinc-400">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
