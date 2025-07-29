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


// Carrusel de imágenes
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

