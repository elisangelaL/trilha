"use client";

import { useState, type FormEvent } from "react";
import { GuestOnly } from "../../components/auth/AuthGuard";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { LogoIcon, ArrowRightIcon } from "../../components/ui/icons";

type Mode = "login" | "signup";

function LoginForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name || email.split("@")[0]);
        setNotice("Conta criada! Verifique seu e-mail para confirmar o cadastro, depois faça login.");
        setMode("login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a ação");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Informe seu e-mail acima para recuperar a senha");
      return;
    }
    setError(null);
    try {
      await resetPassword(email);
      setNotice("Enviamos um link de recuperação para o seu e-mail.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o e-mail de recuperação");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", padding: "32px 24px", justifyContent: "center", gap: 28, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LogoIcon size={26} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ margin: 0, fontSize: 28 }}>Trilha</h1>
      </div>
      <p style={{ margin: 0, fontSize: 15, opacity: 0.8 }}>Planeje viagens em grupo, tudo em um só lugar.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mode === "signup" && (
          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
          </Field>
        )}
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required />
        </Field>
        <Field label="Senha">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </Field>

        {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}
        {notice && <div style={{ color: "var(--color-text)", opacity: 0.8, fontSize: 13 }}>{notice}</div>}

        <Button type="submit" variant="primary" block loading={loading}>
          <ArrowRightIcon size={16} />
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <div className="hr" style={{ margin: 0 }} />

      <Button variant="secondary" block onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Criar conta" : "Já tenho conta"}
      </Button>

      {mode === "login" && (
        <a href="#" onClick={(e) => { e.preventDefault(); void handleForgotPassword(); }} style={{ fontSize: 13 }}>
          Esqueci minha senha
        </a>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  );
}
