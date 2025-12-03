// ==========================
// 🎨 Sistema de tema global (light / dark)
// ==========================

const THEME_STORAGE_KEY = "countdown-theme";

// Meta para el color de la barra del navegador (Android, etc.)
const themeMeta =
  document.querySelector('meta[name="theme-color"]') ||
  document.getElementById("theme-color-meta");

function applyTheme(theme) {
  const root = document.documentElement;

  // Atributo que usan tus CSS: :root[data-theme="dark"] / "light"
  root.setAttribute("data-theme", theme);

  // Guardar en localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn("No se pudo guardar el tema en localStorage:", e);
  }

  // Actualizar <meta name="theme-color">
  if (themeMeta) {
    const color = theme === "dark" ? "#0b0f1a" : "#E8CFDA";
    themeMeta.setAttribute("content", color);
  }

  // Actualizar icono/botón si existen en esta página
  const toggleBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  if (toggleBtn && themeIcon) {
    const isDark = theme === "dark";

    toggleBtn.setAttribute(
      "aria-label",
      isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
    );

    // Aquí adaptas a cómo tengas tus iconos (ejemplo con emojis)
    themeIcon.textContent = isDark ? "🌙" : "☀️";
  }
}

// Leer el tema guardado o poner uno por defecto
(function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (e) {
    console.warn("No se pudo leer el tema de localStorage:", e);
  }

  const initialTheme = saved === "light" || saved === "dark" ? saved : "dark";
  applyTheme(initialTheme);
})();

// Listener del botón de cambio de tema (solo si existe en esa página)
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });
});