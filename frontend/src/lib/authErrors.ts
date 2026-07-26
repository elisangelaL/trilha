/** Traduz mensagens de erro do Supabase Auth para algo amigável em pt-BR. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid api key") || m.includes("invalid apikey")) {
    return "Não foi possível conectar ao servidor no momento. Tente novamente em instantes.";
  }
  if (m.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "Já existe uma conta com esse e-mail.";
  }
  if (m.includes("password should be at least") || m.includes("password is too short")) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "E-mail inválido.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Muitas tentativas seguidas. Aguarde um pouco antes de tentar de novo.";
  }
  if (m.includes("network") || m.includes("fetch failed") || m.includes("failed to fetch")) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível concluir a ação. Tente novamente em instantes.";
}
