const CACHE_NAME = "countdown-v7"; // súbelo a v4, v5... cuando saques versión nueva

// Archivos esenciales que queremos cachear
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",

  "./feedback.html",
  "./feedbackcss.css",
  "./estado.html",
  "./estadocss.css",
  "./kms.html",
  "./kms.css",
  "./eventos.html",
  "./eventos.css",
  "./eventos.js",
  "./recados.html",
  "./recados.css",
  "./recados.js",
  "./cartas.html",
  "./cartas.css",
  "./cartas.js",
  "./3enraya.html",
  "./parchis.html",
  "./parchisprueba.html",
  "./regalo.html",
  "./auth.js",
  "./login.html",
  "./register.html",
  "./user.html",

  // Imágenes principales
  "./fotos/1.png",
  "./fotos/2.png",
  "./fotos/3.png",
  "./fotos/4.png",
  "./fotos/5.png",
  "./fotos/6.png",
  "./fotos/7.png",
  "./fotos/8.png",
  "./fotos/9.png",
  "./fotos/10.png",
  "./fotos/11.png",

  // OJO: los vídeos pesan, la primera carga puede ser más lenta
  "./videos/1.mp4",
  "./videos/2.mp4",
  "./videos/3.mp4",
  "./videos/4.mp4",
  "./videos/5.mp4",
  "./videos/6.mp4",
  "./videos/7.mp4",
  "./videos/8.mp4",
  "./videos/9.mp4",
  "./videos/10.mp4",
  "./videos/11.mp4",
  "./videos/12.mp4",
  "./videos/13.mp4",
  "./videos/14.mp4",
  "./videos/15.mp4",
];

// Instalación: pre-cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Activar inmediatamente la nueva versión del SW
  self.skipWaiting();
});

// Activación: limpiar versiones antiguas y avisar a los clientes
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();

      // Avisar a todas las ventanas de que hay nueva versión
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
      }
    })()
  );
});

// Interceptar peticiones
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Solo cacheamos GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // ❌ No cachear NUNCA las peticiones a Supabase (datos dinámicos)
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(fetch(request));
    return;
  }

  // ✅ Resto de archivos (HTML, CSS, JS, imágenes, vídeos...) sí se cachean
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devuelve de caché si existe
        return cachedResponse;
      }

      // Si no, pide a la red y guarda copia
      return fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => {
          // Página fallback offline
          return caches.match("./index.html");
        });
    })
  );
});