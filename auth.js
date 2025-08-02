// auth.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==========================
// 🔧 TU PROYECTO SUPABASE
// ==========================
const SUPABASE_URL = "https://bdgivulpjwzlnjgmwazm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZ2l2dWxwand6bG5qZ213YXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODU4OTUsImV4cCI6MjA2OTQ2MTg5NX0.tWxMsaPa_4XHXJhZUpL_QKxxGYrkhCrI_L_qZr9ILsc";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================
// 🔐 Hash sencillo (SHA-256)
// ==========================
async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function deriveHash(name, passphrase) {
  const normalized = `${String(name || "").toLowerCase()}:${passphrase}`;
  return sha256Hex(normalized);
}

// ==========================
// 🕒 Sesión local (2h) — SIN sincronizar con el contador
// ==========================
const SESSION_KEY = "playerSession";

// Duración de la sesión (2h). Cambia aquí si quieres probar 1 minuto: 1 * 60 * 1000
const SESSION_WINDOW_MS = 2 * 60 * 60 * 1000; // 2h

// Alias por compatibilidad (en caso de que en otro archivo se lea UNLOCK_WINDOW_MS)
export const UNLOCK_WINDOW_MS = SESSION_WINDOW_MS;

const ALIGN_UNLOCK_WITH_SESSION = false; // ⛔ no tocar 'unlockUntilTs'

// ==========================
// 🔁 Post-login redirect
// ==========================
const REDIRECT_KEY = "postLoginRedirect";

// Detecta basePath para GitHub Pages (p. ej. "/Countdown/")
function getAppBasePath() {
  // Si es *.github.io y hay subruta tipo /repo/...
  if (location.hostname.endsWith("github.io")) {
    const parts = location.pathname.split("/").filter(Boolean); // ["repo","..."]
    if (parts.length > 0) return `/${parts[0]}/`;
  }
  return "/"; // root en hosting normal
}

// Resuelve una ruta de la app (p. ej. "login.html") a una ruta absoluta dentro del basePath
function resolveAppPath(path = "index.html") {
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  const base = getAppBasePath();
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${clean}`;
}

// Evita open-redirects: solo permite volver a la MISMA origin
function sanitizeNextUrl(next, fallback = "index.html") {
  const safeFallback = resolveAppPath(fallback);
  try {
    const u = new URL(next, location.origin);
    if (u.origin === location.origin) {
      return u.pathname + u.search + u.hash;
    }
  } catch {}
  return safeFallback;
}

export function getCurrentPlayer() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.name || !s?.expiresAt) return null;
    if (Date.now() >= s.expiresAt) {
      // Solo limpiamos la sesión; NO tocamos el contador
      clearSession();
      return null;
    }
    return { name: s.name, expiresAt: s.expiresAt };
  } catch {
    return null;
  }
}

export function setSession(name, { alignUnlock = ALIGN_UNLOCK_WITH_SESSION } = {}) {
  const expiresAt = Date.now() + SESSION_WINDOW_MS;
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ name: String(name).toLowerCase(), expiresAt })
  );

  // ⛔ Separado del contador (solo si explícitamente se pide, se sincroniza)
  if (alignUnlock) {
    try { localStorage.setItem("unlockUntilTs", String(expiresAt)); } catch {}
  }

  // Auto-logout cuando expire (NO borra el desbloqueo del contador)
  const msLeft = expiresAt - Date.now();
  if (msLeft > 0) {
    setTimeout(() => {
      clearSession();
      // ❌ No tocar 'unlockUntilTs' aquí
      // location.reload(); // opcional
    }, msLeft);
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function logout() {
  // Cerrar sesión sin afectar al estado del contador
  clearSession();
  // ❌ No borrar 'unlockUntilTs' aquí
}

// ✅ Recuerda a dónde quería ir el usuario y añade ?next=...
export function requireAuth({ redirectTo = "login.html", rememberNext = true } = {}) {
  const s = getCurrentPlayer();
  if (!s) {
    const next = location.pathname + location.search + location.hash;
    if (rememberNext) {
      try { localStorage.setItem(REDIRECT_KEY, next); } catch {}
    }
    const loginUrl = new URL(resolveAppPath(redirectTo), location.origin);
    if (rememberNext) loginUrl.searchParams.set("next", next);
    window.location.href = loginUrl.toString();
    return null;
  }
  return s;
}

export function currentPlayerName() {
  const s = getCurrentPlayer();
  return s ? s.name : null; // 'angel' | 'lily' | null
}

// ✅ Llamar tras login/registro correcto para volver a la página original
export function consumePostLoginRedirect(defaultUrl = "index.html") {
  const params = new URLSearchParams(location.search);
  let next = params.get("next");

  if (!next) {
    try { next = localStorage.getItem(REDIRECT_KEY); } catch {}
  }

  const safeNext = sanitizeNextUrl(next, defaultUrl);
  try { localStorage.removeItem(REDIRECT_KEY); } catch {}

  // replace() para no dejar el login en el historial
  window.location.replace(safeNext);
}

// ==========================
// 🧾 Registro
// ==========================
export async function registerPlayer({ name, passphrase }) {
  const allowed = ["angel", "lily"];
  const n = String(name || "").toLowerCase();
  if (!allowed.includes(n)) throw new Error("Debes elegir Ángel o Lily.");
  if (!passphrase || passphrase.length < 3) throw new Error("La palabra clave debe tener al menos 3 caracteres.");

  // ¿Ya existe?
  const { data: existing, error: selErr } = await supabase
    .from("players")
    .select("id")
    .eq("name", n)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) throw new Error("Ese usuario ya está registrado.");

  const secret_hash = await deriveHash(n, passphrase);
  const { error } = await supabase.from("players").insert({ name: n, secret_hash });
  if (error) throw error;

  setSession(n);
  return { ok: true, name: n };
}

// ==========================
// 🔓 Login
// ==========================
export async function loginPlayer({ name, passphrase }) {
  const n = String(name || "").toLowerCase();
  if (!["angel", "lily"].includes(n)) throw new Error("Usuario inválido.");

  const input_hash = await deriveHash(n, passphrase);

  const { data, error } = await supabase
    .from("players")
    .select("secret_hash")
    .eq("name", n)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Usuario no encontrado. ¿Te has registrado?");

  if (data.secret_hash !== input_hash) {
    throw new Error("Palabra clave incorrecta.");
  }

  setSession(n);
  return { ok: true, name: n };
}

// Programa el auto-logout si ya había sesión al cargar este módulo
(() => {
  const s = getCurrentPlayer();
  if (s) {
    const msLeft = s.expiresAt - Date.now();
    if (msLeft > 0) {
      setTimeout(() => {
        clearSession();
        // ❌ No tocar 'unlockUntilTs' aquí
        // location.reload(); // opcional
      }, msLeft);
    }
  }
})();
