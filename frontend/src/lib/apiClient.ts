import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiRequestError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiRequestError(res.status, body?.error ?? `Erro na requisição (${res.status})`, body?.details);
  }

  return body as T;
}

/** GET/POST/DELETE com corpo JSON. Injeta o access_token do Supabase automaticamente. */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...authHeader,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return handleResponse<T>(res);
}

/** POST multipart/form-data (upload de foto/recibo/áudio). */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const authHeader = await getAuthHeader();

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeader,
    body: formData,
  });

  return handleResponse<T>(res);
}
