const FETCH_TIMEOUT_MS = 4000;

function extractYoutubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") return url.pathname.slice(1) || null;
  if (!url.hostname.endsWith("youtube.com")) return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] ?? null;
  if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] ?? null;
  return null;
}

function extractOgImage(html: string): string | null {
  const match =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ??
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/**
 * Best-effort: nunca deve derrubar a criação do item. YouTube usa uma URL previsível de
 * thumbnail (sem precisar baixar a página); para os demais links, tenta raspar og:image.
 */
export async function fetchThumbnailForUrl(rawUrl: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TrilhaLinkPreview/1.0)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const html = await res.text();
    const ogImage = extractOgImage(html);
    if (!ogImage) return null;

    return new URL(ogImage, url).toString();
  } catch (err) {
    console.error(`Falha ao buscar thumbnail para ${rawUrl}:`, (err as Error).message);
    return null;
  }
}
