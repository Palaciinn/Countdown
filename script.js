// ==========================
// 🕒 Cuenta regresiva
// ==========================
const countdownDate = new Date("2025-08-04T08:20:00").getTime();

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
  "fotos/11.png"
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

// Preguntas y respuestas
const questions = [
  { question: "¿Cómo se llama mi perro?", answer: "marcus" },
  { question: "¿Cómo se llama el novio de mi madre?", answer: "jose" },
  { question: "¿En qué medio de transporte transportan mi ego?", answer: "avion" },
  { question: "¿Cuál es mi cóctel favorito?", answer: "mojito" },
  { question: "¿De qué team soy?", answer: "tetas" },
  { question: "¿De qué lado está mi boobbie favorita?", answer: ["izquierdo", "izquierda"] }
];

let currentAnswer = "";
let currentQuestion = "";
let changeCount = 0;
const maxChangesBeforeMsg = 2;

const loadRandomQuestion = () => {
  let newQuestion;
  do {
    newQuestion = questions[Math.floor(Math.random() * questions.length)];
  } while (newQuestion.question === currentQuestion);

  currentQuestion = newQuestion.question;
  questionText.textContent = currentQuestion;
  currentAnswer = newQuestion.answer;
  answerInput.value = "";
  answerInput.focus();

  if (changeCount > maxChangesBeforeMsg) {
    errorMessage.textContent = "¿Eres tonta o cotilla?";
  } else {
    errorMessage.textContent = "";
  }
};

unlockBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  questionPopup.classList.remove("hidden");
  mainContent.classList.add("blur");
  changeCount = 0;
  loadRandomQuestion();
});

submitAnswer.addEventListener("click", () => {
  const userAnswer = answerInput.value.trim().toLowerCase();
  const isCorrect =
    typeof currentAnswer === "string"
      ? userAnswer === currentAnswer
      : currentAnswer.includes(userAnswer);

  if (isCorrect) {
    // Ocultar el popup de la pregunta y quitar blur
    questionPopup.classList.add("hidden");
    mainContent.classList.remove("blur");

    // ✅ Quitar el estado bloqueado para que el header sea clickable ya
    document.body.classList.remove("locked");

    // Mostrar banner
    showInfoBanner();

    // Guardar la ventana de desbloqueo
    try { setUnlockedForWindow(); } catch (e) {}

    // (Opcional) Asegurar el popup inicial escondido por si acaso
    popup.classList.add("hidden");
  } else {
    errorMessage.textContent = "Respuesta incorrecta. Intenta de nuevo.";
  }
});

changeQuestionBtn.addEventListener("click", () => {
  changeCount++;
  loadRandomQuestion();
});

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
