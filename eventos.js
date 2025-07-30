import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configura tu Supabase
const supabaseUrl = 'https://bdgivulpjwzlnjgmwazm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZ2l2dWxwand6bG5qZ213YXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODU4OTUsImV4cCI6MjA2OTQ2MTg5NX0.tWxMsaPa_4XHXJhZUpL_QKxxGYrkhCrI_L_qZr9ILsc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mostrar popup para añadir evento
document.getElementById("open-add-event").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("event-popup").classList.remove("hidden");
});
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("event-popup").classList.add("hidden");
});

// Añadir evento
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

  // Insertar en Supabase (fecha como string para bigint)
  const { data, error } = await supabase
    .from('eventos')
    .insert([{ 
      titulo: String(title), 
      fecha: String(fixedDate.getTime()), 
      fijo: false 
    }]);

  if (error) {
    console.error("🔴 Supabase insert error:", error);
    alert("Error al guardar el evento: " + (error.message || JSON.stringify(error)));
    return;
  }

  console.log("✅ Evento guardado correctamente:", data);

  // Mostrar en la interfaz
  renderEvent({ titulo: title, fecha: fixedDate.getTime(), fijo: false });

  document.getElementById("event-title").value = "";
  document.getElementById("event-date").value = "";
  document.getElementById("event-popup").classList.add("hidden");
});

// Mostrar todos los eventos
window.addEventListener("DOMContentLoaded", async () => {
  const { data, error } = await supabase.from('eventos').select('*');
  if (error) {
    console.error("Error al cargar eventos:", error);
    return;
  }

  data.forEach(evento => renderEvent(evento));
});

// Mostrar un evento con cuenta atrás
function renderEvent(evento) {
  const container = document.getElementById("event-list");
  const fecha = new Date(Number(evento.fecha));
  const card = document.createElement("div");
  card.className = "card";

  const isBirthday = evento.fijo;

  card.innerHTML = `
    <h2>${isBirthday ? "🎂" : "🎉"} ${evento.titulo}</h2>
    <p class="date-note">${fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    <div class="countdown"></div>
    ${!isBirthday ? `<button class="delete-btn">🗑️ Eliminar</button>` : ""}
  `;

  container.appendChild(card);
  iniciarCuentaAtras(card.querySelector(".countdown"), fecha.getTime());

  // Si no es cumpleaños, permitir eliminar
  if (!isBirthday) {
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      const { error } = await supabase.from('eventos').delete().eq('id', evento.id);
      if (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el evento");
      } else {
        card.remove();
      }
    });
  }
}

// Cuenta atrás
function iniciarCuentaAtras(elemento, fechaObjetivo) {
  const intervalo = setInterval(() => {
    const diff = fechaObjetivo - Date.now();
    if (diff <= 0) {
      elemento.innerHTML = `<span>¡Evento iniciado!</span>`;
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

// Inicializar cumpleaños fijos que están en el HTML
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".countdown[data-date]").forEach(el => {
    let targetDate = new Date(el.dataset.date);
    const now = new Date();
    if (targetDate < now) {
      targetDate.setFullYear(now.getFullYear() + 1);
    }
    iniciarCuentaAtras(el, targetDate.getTime());
  });
});
