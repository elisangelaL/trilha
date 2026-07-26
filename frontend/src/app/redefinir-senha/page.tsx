"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Field, PasswordInput } from "../../components/ui/Field";
import { LogoIcon, ArrowRightIcon } from "../../components/ui/icons";
import { friendlyAuthError } from "../../lib/authErrors";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? friendlyAuthError(err.message)
          : "Não foi possível redefinir a senha. Peça um novo link em 'Esqueci minha senha'.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", padding: "32px 24px", justifyContent: "center", gap: 28, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <LogoIcon size={26} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ margin: 0, fontSize: 28 }}>Trilha</h1>
      </div>

      {done ? (
        <>
          <p style={{ margin: 0, fontSize: 15 }}>Senha redefinida com sucesso!</p>
          <Button variant="primary" block onClick={() => router.push("/")}>
            <ArrowRightIcon size={16} />
            Continuar
          </Button>
        </>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.8 }}>Escolha uma nova senha para sua conta.</p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Nova senha">
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </Field>
            <Field label="Confirmar nova senha">
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
            </Field>

            {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}

            <Button type="submit" variant="primary" block loading={loading}>
              <ArrowRightIcon size={16} />
              Salvar nova senha
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
