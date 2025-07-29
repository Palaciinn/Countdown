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
const imageList = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png"];
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

// Función para cargar una nueva pregunta aleatoria
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

  // Mostrar el mensaje si se cambió más de 2 veces
  if (changeCount > maxChangesBeforeMsg) {
    errorMessage.textContent = "¿Eres tonta o cotilla?";
  } else {
    errorMessage.textContent = "";
  }
};

// Al hacer click en desbloquear
unlockBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
  questionPopup.classList.remove("hidden");
  mainContent.classList.add("blur");
  changeCount = 0;
  loadRandomQuestion();
});

// Validar respuesta
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

// Cambiar pregunta (sin límite, pero con mensaje)
changeQuestionBtn.addEventListener("click", () => {
  changeCount++;
  loadRandomQuestion();
});
