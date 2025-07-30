const board = document.getElementById("board");
const winMessage = document.getElementById("winMessage");
const retryButton = document.getElementById("retryButton");

const images = [
  "1.png", "2.png", "3.png", "4.png", "5.png",
  "6.png", "7.png", "8.png", "9.png", "10.png", "11.png"
];

function iniciarJuego() {
  board.innerHTML = "";
  winMessage.classList.add("hidden");
  retryButton.classList.add("hidden");

  let flipped = [];
  let matchedPairs = 0; // ✅ Reinicio correcto

  // Selecciona 6 imágenes aleatorias (12 cartas)
  const selected = images.slice().sort(() => Math.random() - 0.5).slice(0, 6);
  const cardsArray = [...selected, ...selected].sort(() => Math.random() - 0.5);

  cardsArray.forEach(img => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back" style="background-image: url('fotos/${img}')"></div>
      </div>
    `;
    card.dataset.img = img;
    board.appendChild(card);

    card.addEventListener("click", () => {
      if (card.classList.contains("flipped") || flipped.length === 2) return;

      card.classList.add("flipped");
      flipped.push(card);

      if (flipped.length === 2) {
        const [a, b] = flipped;
        if (a.dataset.img === b.dataset.img) {
          matchedPairs++;
          flipped = [];

          // ✅ Solo mostrar mensaje al terminar
          if (matchedPairs === 6) {
            setTimeout(() => {
              winMessage.classList.remove("hidden");
              retryButton.classList.remove("hidden");
            }, 500);
          }
        } else {
          setTimeout(() => {
            a.classList.remove("flipped");
            b.classList.remove("flipped");
            flipped = [];
          }, 800);
        }
      }
    });
  });
}

// Botón reintentar
retryButton.addEventListener("click", iniciarJuego);

// Iniciar al cargar
window.addEventListener("DOMContentLoaded", iniciarJuego);
