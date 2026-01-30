// ==========================
// ⏳ Contador progresivo estable
// ==========================
// const startDate = new Date("2025-08-18T17:30:00").getTime();
// Si necesitas fijar huso horario (Madrid en agosto, CEST, UTC+02):
// const startDate = new Date("2025-10-02T17:30:00+02:00").getTime();

/*
let timerId;

const render = (elapsed) => {
  if (elapsed < 0) {
    document.querySelector(".countdown").innerHTML = "<h2>El contador aún no ha comenzado</h2>";
    return;
  }

  const days = Math.floor(elapsed / 86400000); // 1000*60*60*24
  const hours = Math.floor((elapsed % 86400000) / 3600000); // 1000*60*60
  const minutes = Math.floor((elapsed % 3600000) / 60000);  // 1000*60
  const seconds = Math.floor((elapsed % 60000) / 1000);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
};

const tick = () => {
  const now = Date.now();
  render(now - startDate);

  // Alinear el siguiente tick al próximo "cambio de segundo" real
  // y añadir un pequeño colchón para evitar programar con 0 ms.
  const delay = (1000 - (now % 1000)) + 5;
  timerId = setTimeout(tick, delay);
};

// Re-sincroniza al volver a la pestaña (evita saltos al regresar)
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    clearTimeout(timerId);
    tick();
  }
});

tick();

*/

// ==========================
// 🕒 Cuenta regresiva
// ==========================

const countdownDate = new Date("2026-01-23T18:50:00").getTime();

const updateCountdown = () => {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  if (distance <= 0) {
    document.querySelector(".countdown").innerHTML = "<h2>¡El tiempo se ha agotado!</h2>";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
};

updateCountdown();
setInterval(updateCountdown, 1000);


// ==========================
// 🖼️ Carrusel de imágenes
// ==========================
const imageElement = document.getElementById("carousel-image");
const imageList = [
  "fotos/1.png",
  "fotos/2.png",
  "fotos/3.png",
  "fotos/4.png",
  "fotos/5.png",
  "fotos/6.png",
  "fotos/7.png",
  "fotos/8.png",
  "fotos/9.png",
  "fotos/10.png",
  "fotos/11.png",
  "fotos/12.png",
  "fotos/13.png",
  "fotos/14.png",
  "fotos/15.png",
  "fotos/16.png",
  "fotos/17.png",
  "fotos/18.png",
  "fotos/19.png",
  "fotos/20.png",
  "fotos/21.png",
  "fotos/22.png"
];
let currentImageIndex = 0;

setInterval(() => {
  currentImageIndex = (currentImageIndex + 1) % imageList.length;
  imageElement.style.opacity = 0;
  setTimeout(() => {
    imageElement.src = imageList[currentImageIndex];
    imageElement.style.opacity = 1;
  }, 500);
}, 4000);

// ==========================
// 💬 Saludo según la hora
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  const popupText = document.getElementById("popup-text");

  if (hour >= 7 && hour < 14) {
    popupText.textContent = "Buenos días princesa ☀️";
  } else if (hour >= 14 && hour < 20) {
    popupText.textContent = "Buenas tardes cosa 🌇";
  } else {
    popupText.textContent = "Buenas noches cariño 🌙";
  }
});

// ==========================
// 🔒 Desbloqueo con pregunta aleatoria
// ==========================
const unlockBtn = document.getElementById("unlock-btn");
const popup = document.getElementById("popup-message");
const questionPopup = document.getElementById("question-popup");
const mainContent = document.querySelector(".main-content");
const answerInput = document.getElementById("answer-input");
const submitAnswer = document.getElementById("submit-answer");
const errorMessage = document.getElementById("error-message");
const questionText = document.getElementById("question-text");
const changeQuestionBtn = document.getElementById("change-question");

// Helper para mostrar el banner correctamente (quita 'hidden' y añade 'show')
const showInfoBanner = () => {
  const infoBanner = document.getElementById("info-banner");
  if (!infoBanner) return;
  infoBanner.classList.remove("hidden");
  infoBanner.classList.add("show");
};

// ==========================
// ⏳ Persistencia de desbloqueo (2h) con localStorage
// ==========================
const UNLOCK_KEY = "unlockUntilTs";
const UNLOCK_WINDOW_MS = 2 * 60 * 60 * 1000; // 2h

const getUnlockUntil = () => {
  const v = localStorage.getItem(UNLOCK_KEY);
  const n = v ? parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
};

const isUnlocked = () => Date.now() < getUnlockUntil();

const setUnlockedForWindow = () => {
  const until = Date.now() + UNLOCK_WINDOW_MS;
  localStorage.setItem(UNLOCK_KEY, String(until));
};

const applyUnlockState = () => {
  if (isUnlocked()) {
    // Ocultar popups y quitar blur si estamos dentro de la ventana
    popup.classList.add("hidden");
    questionPopup.classList.add("hidden");
    mainContent.classList.remove("blur");

    // Quitar estado bloqueado -> header usable
    document.body.classList.remove("locked");

    // Mostrar el banner si existe (si lo comentaste, no hace nada)
    if (typeof showInfoBanner === "function") showInfoBanner();
  } else {
    // Mostrar flujo de desbloqueo
    popup.classList.remove("hidden");
    questionPopup.classList.add("hidden");
    mainContent.classList.add("blur");

    // Marcar página bloqueada -> header deshabilitado
    document.body.classList.add("locked");

    // (Opcional) Ocultar el banner si estuviera visible
    const infoBanner = document.getElementById("info-banner");
    if (infoBanner) infoBanner.classList.add("hidden");
  }
};

// Aplicar estado al cargar
document.addEventListener("DOMContentLoaded", applyUnlockState);

// ==========================
// ✅ Preguntas y respuestas (ÚNICA parte tocada)
// ==========================
const questions = [
  { question: "Introduzca la contraseña" }
];

// Si solo hay 1 pregunta, ocultamos el botón de recargar (si existe)
if (questions.length <= 1 && changeQuestionBtn) {
  changeQuestionBtn.style.display = "none";
}

let currentAnswer = "";
let currentQuestion = "";
let changeCount = 0;
const maxChangesBeforeMsg = 2;

const loadRandomQuestion = () => {
  let newQuestion;

  // Evita bucle infinito si solo hay 1 pregunta
  if (questions.length === 1) {
    newQuestion = questions[0];
  } else {
    do {
      newQuestion = questions[Math.floor(Math.random() * questions.length)];
    } while (newQuestion.question === currentQuestion);
  }

  currentQuestion = newQuestion.question;
  questionText.textContent = currentQuestion;

  // Ya no guardamos la respuesta en el front
  currentAnswer = "";

  answerInput.value = "";
  answerInput.focus();

  errorMessage.textContent = "";
};

unlockBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  questionPopup.classList.remove("hidden");
  mainContent.classList.add("blur");
  changeCount = 0;
  loadRandomQuestion();
});

submitAnswer.addEventListener("click", async () => {
  const userAnswer = answerInput.value.trim();

  // Si no existe el cliente, avisamos (no tocamos nada más)
  if (!window.sb || !window.sb.functions || typeof window.sb.functions.invoke !== "function") {
    errorMessage.textContent = "Error de conexión. Recarga la página.";
    return;
  }

  try {
    const { data, error } = await window.sb.functions.invoke("check-pass", {
      body: { pass: userAnswer }
    });

    if (error) throw error;

    const isCorrect = data?.ok === true;

    if (isCorrect) {
      questionPopup.classList.add("hidden");
      mainContent.classList.remove("blur");
      document.body.classList.remove("locked");
      showInfoBanner();
      try { setUnlockedForWindow(); } catch (e) {}
      popup.classList.add("hidden");
    } else {
      errorMessage.textContent = "Respuesta incorrecta. Intenta de nuevo.";
    }
  } catch (err) {
    console.error("Edge Function error:", err);
    errorMessage.textContent = "Error de verificación. Inténtalo de nuevo.";
  }
});

// Si el botón existe, permitimos "cambiar pregunta" (aunque con 1 está oculto)
if (changeQuestionBtn) {
  changeQuestionBtn.addEventListener("click", () => {
    changeCount++;
    loadRandomQuestion();
  });
}

// ==========================
// 🌟 Estrellas de fondo SOLO en sección
// ==========================
document.querySelectorAll(".custom-button .starry-background").forEach(container => {
  const totalStars = 10; // cantidad por botón
  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.width = star.style.height = Math.random() * 3 + "px";
    star.style.animationDelay = Math.random() * 3 + "s";
    container.appendChild(star);
  }
});

document.querySelectorAll(".custom-button .starry-background, .time-box .starry-background").forEach(container => {
  const totalStars = 20; // menos para tarjetas pequeñas
  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.width = star.style.height = Math.random() * 3 + "px";
    star.style.animationDelay = Math.random() * 3 + "s";
    container.appendChild(star);
  }
});

// ==========================
// 🗨️ Tarjeta flotante: frases que rotan cada minuto
// ==========================
(() => {
  const phrases = [
    "¿Lista para el abrazo más largo del mundo? Yo sí.",
    "Pronto se acabarán los besos virtuales.",
    "Espero que tu petete este listo para verme",
    "No saques la lengua... Te estoy viendo",
    "Creo que es una buena hora para que me llames",
    "¡Mare que cosa!",
    "¿Escuchas el avión?",
    "Te mataré. (A besos)",
    "¿Por qué siento que este contador no baja?",
    "Echo de menos tu olor a choni",
    "Amego, ¿tiene un segarro?",
    "¿Por qué no jugamos un rato a algo?",
    "¿Se te ocurre alguna función nueva? Mándamela en el feedback",
    "Dia 234 intentando que Lily me llame pesado...",
    "Yo no ronco, respiro fuerte",
    "Ojala Marta y Lobato se casen",
    "Elias, no me olvido de ti...",
    "Deja de absorberme...",
    "En una pelea entre Paco y Maya ¿Quién ganaría?",
    "Debería estar besándote… y no programando",
    "Ayer soñé con el amor de mi vida... Un GT3"
  ];

  const el = document.getElementById("phrase-text");
  const card = document.getElementById("phrase-card");
  if (!el || !card) return;

  let lastIndex = -1;

  const pickIndex = () => {
    if (phrases.length === 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * phrases.length); }
    while (i === lastIndex);
    lastIndex = i;
    return i;
  };

  const setPhrase = () => {
    const i = pickIndex();
    // Pequeña transición de entrada/salida
    card.style.opacity = 0;
    card.style.transform = "translateY(-2px)";
    setTimeout(() => {
      el.textContent = `“${phrases[i]}”`; // ✅ Añade comillas decorativas
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";

      // ✅ Reiniciar barra de progreso
      const bar = document.getElementById("progress-bar");
      if (bar) {
        bar.style.animation = "none";      // parar animación
        bar.offsetHeight;                  // forzar reflow
        bar.style.animation = "fillBar 60s linear forwards";
      }
    }, 180);
  };

  // Primera carga inmediata
  setPhrase();
  // Cambiar cada minuto
  setInterval(setPhrase, 60 * 1000);
})();

// ==========================
// 🎨 Modo claro / oscuro
// ==========================
const THEME_STORAGE_KEY = "countdown-theme";

const themeMeta = document.querySelector('meta[name="theme-color"]') || document.getElementById("theme-color-meta");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

const applyTheme = (theme) => {
  // Guardamos en localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // opcional: sincronizar también con "theme" por compatibilidad
    localStorage.setItem("theme", theme);
  } catch (e) {}

  // Aplicamos al <html>
  document.documentElement.setAttribute("data-theme", theme);

  // Cambiamos el meta theme-color para la PWA / barra del navegador
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "dark" ? "#0f172a" : "#E8CFDA");
  }

  // Icono del botón
  if (themeIcon) {
    themeIcon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
  }
};

const getInitialTheme = () => {
  // 1) Preferencia guardada
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {}

  // 2) Ya NO miramos el modo del sistema
  // 3) Por defecto SIEMPRE claro
  return "light";
};

// Aplica tema al cargar
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

// Toggle al pulsar el botón
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || initialTheme;
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

// Si el usuario cambia el modo del sistema mientras está abierta la app
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", (e) => {
    // Solo cambiamos automáticamente si el usuario no ha elegido uno explícito
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("theme");
      if (!stored) {
        applyTheme(e.matches ? "dark" : "light");
      }
    } catch (err) {}
  });
}

// ==========================
// 🧩 Registro del Service Worker (PWA) + auto-update
// ==========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((reg) => {
        console.log("Service Worker registrado:", reg.scope);
      })
      .catch((err) => {
        console.error("Error al registrar el Service Worker:", err);
      });
  });

  // Escuchar mensajes del Service Worker (nueva versión, etc.)
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "NEW_VERSION_AVAILABLE") {
    console.log("Nueva versión de la PWA detectada.");

    // Mostrar aviso visual al usuario
    showUpdateToast();

    // Esperar 1 segundo para que se vea la animación del toast
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    }
  });
}

function showUpdateToast() {
  const toast = document.getElementById("update-toast");
  if (!toast) return;

  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
}