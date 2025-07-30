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
const imageList = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "11.png"];
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
    questionPopup.classList.add("hidden");
    mainContent.classList.remove("blur");
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
