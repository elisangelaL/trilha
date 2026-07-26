const CACHE_NAME = "trilha-cache-v3";
const APP_SHELL = ["/", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Só cuida de GET no mesmo domínio. Chamadas à API (rewrite /api/backend no mesmo domínio em
  // produção) nunca devem ser cacheadas, senão o feed/dados ficam presos na resposta antiga.
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  // Só arquivos com hash de build no nome (imutáveis) valem cache-first.
  const isImmutableStatic = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");

  if (isImmutableStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      }),
    );
    return;
  }

  // Tudo mais — navegação de página, payloads RSC do App Router (fetch de client-side
  // navigation), manifest, etc. — sempre tenta a rede primeiro. Sem isso, qualquer uma
  // dessas respostas fica cacheada indefinidamente e a página/dado nunca atualiza sozinho.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || (request.mode === "navigate" ? caches.match("/") : undefined))),
  );
});
