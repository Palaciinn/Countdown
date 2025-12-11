// Usamos el cliente compartido desde auth.js (mismo que en recados.js)
import { supabase } from "./auth.js";

// === Mostrar popup para añadir evento ===
document.getElementById("open-add-event").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("event-popup").classList.remove("hidden");
});

document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("event-popup").classList.add("hidden");
});

// === Añadir evento dinámico ===
document.getElementById("add-event-btn").addEventListener("click", async () => {
  const title = document.getElementById("event-title").value.trim();
  const dateValue = document.getElementById("event-date").value;

  if (!title || !dateValue) {
    alert("Por favor completa todos los campos");
    return;
  }

  const fixedDate = new Date(dateValue);
  const now = new Date();
  if (fixedDate < now) {
    fixedDate.setFullYear(now.getFullYear() + 1);
  }

  // Insertar en Supabase
  const { data, error } = await supabase
    .from("eventos")
    .insert([
      {
        titulo: String(title),
        fecha: String(fixedDate.getTime()),
        fijo: false,
      },
    ])
    .select();

  if (error) {
    console.error("🔴 Supabase insert error:", error);
    alert("Error al guardar el evento: " + (error.message || JSON.stringify(error)));
    return;
  }

  console.log("✅ Evento guardado correctamente:", data);
  renderEvent({
    id: data[0].id,
    titulo: title,
    fecha: fixedDate.getTime(),
    fijo: false,
  });

  document.getElementById("event-title").value = "";
  document.getElementById("event-date").value = "";
  document.getElementById("event-popup").classList.add("hidden");
});

// === Renderizar un evento en la lista dinámica ===
function renderEvent(evento) {
  const container = document.getElementById("event-dynamic-list");
  const fecha = new Date(Number(evento.fecha));
  const card = document.createElement("div");
  card.className = "card";

  const isBirthday = evento.fijo;

  card.innerHTML = `
    <h2>${isBirthday ? "🎂" : "🎉"} ${evento.titulo}</h2>
    <p class="date-note">${fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}</p>
    <div class="countdown"></div>
    ${!isBirthday ? `<button class="delete-btn">🗑️ Eliminar</button>` : ""}
  `;

  container.appendChild(card);
  iniciarCuentaAtras(card.querySelector(".countdown"), fecha.getTime());

  // Botón eliminar solo para eventos dinámicos
  if (!isBirthday) {
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      const { error } = await supabase.from("eventos").delete().eq("id", evento.id);
      if (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el evento");
      } else {
        card.remove();
      }
    });
  }
}

// === Función cuenta atrás ===
function iniciarCuentaAtras(elemento, fechaObjetivo) {
  const intervalo = setInterval(() => {
    const diff = fechaObjetivo - Date.now();
    if (diff <= 0) {
      elemento.innerHTML = `<span>¡Completado!</span>`;
      clearInterval(intervalo);
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    elemento.innerHTML = `
      <div><span class="num">${d}</span><span class="lbl">Días</span></div>
      <div><span class="num">${h}</span><span class="lbl">Horas</span></div>
      <div><span class="num">${m}</span><span class="lbl">Min</span></div>
      <div><span class="num">${s}</span><span class="lbl">Seg</span></div>
    `;
  }, 1000);
}

// === Inicializar cumpleaños y cargar eventos Supabase ===
window.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Inicializar cumpleaños fijos (los que vienen en el HTML con data-date)
  document.querySelectorAll(".countdown[data-date]").forEach((el) => {
    let targetDate = new Date(el.dataset.date);
    const now = new Date();
    if (targetDate < now) {
      targetDate.setFullYear(now.getFullYear() + 1);
    }
    iniciarCuentaAtras(el, targetDate.getTime());
  });

  // 2️⃣ Cargar eventos guardados en Supabase ordenados por fecha ascendente
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("fecha", { ascending: true });

  if (error) {
    console.error("Error al cargar eventos:", error);
    return;
  }

  data.forEach((evento) => renderEvent(evento));
});