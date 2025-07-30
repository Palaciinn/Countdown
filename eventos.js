import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://bdgivulpjwzlnjgmwazm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZ2l2dWxwand6bG5qZ213YXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODU4OTUsImV4cCI6MjA2OTQ2MTg5NX0.tWxMsaPa_4XHXJhZUpL_QKxxGYrkhCrI_L_qZr9ILsc'
)

// Mostrar formulario
document.getElementById("open-add-event").addEventListener("click", (e) => {
  e.preventDefault()
  document.getElementById("event-popup").classList.remove("hidden")
})
document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("event-popup").classList.add("hidden")
})

// Añadir evento
document.getElementById("add-event-btn").addEventListener("click", async () => {
  const title = document.getElementById("event-title").value.trim()
  const dateValue = document.getElementById("event-date").value
  if (!title || !dateValue) return alert("Por favor completa todos los campos")

  const date = new Date(dateValue)
  const fixedDate = new Date(date.getTime())
  if (fixedDate < new Date()) fixedDate.setFullYear(new Date().getFullYear() + 1)

  const { data, error } = await supabase
    .from('eventos')
    .insert([{ titulo: title, fecha: fixedDate.toISOString(), fijo: false }])

  if (error) return alert("Error al guardar el evento")

  crearCard(title, fixedDate, data[0].id)
  document.getElementById("event-popup").classList.add("hidden")
  document.getElementById("event-title").value = ""
  document.getElementById("event-date").value = ""
})

// Crear tarjeta
function crearCard(title, date, id) {
  const list = document.getElementById("event-list")
  const card = document.createElement("div")
  card.className = "card"
  card.innerHTML = `
    <span class="delete-btn" title="Eliminar evento">🗑</span>
    <h2>🎉 ${title}</h2>
    <p class="date-note">${date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    <div class="countdown"></div>
  `
  list.appendChild(card)
  iniciarCuentaAtras(card.querySelector(".countdown"), date.getTime())

  card.querySelector(".delete-btn").addEventListener("click", async () => {
    await supabase.from('eventos').delete().eq('id', id)
    card.remove()
  })
}

// Iniciar cuenta atrás
function iniciarCuentaAtras(elemento, fechaObjetivo) {
  const update = () => {
    const diff = fechaObjetivo - Date.now()
    if (diff <= 0) {
      elemento.innerHTML = `<span>¡Evento iniciado!</span>`
      return
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    elemento.innerHTML = `
      <div><span class="num">${days}</span><span class="lbl">Días</span></div>
      <div><span class="num">${hours}</span><span class="lbl">Horas</span></div>
      <div><span class="num">${minutes}</span><span class="lbl">Min</span></div>
      <div><span class="num">${seconds}</span><span class="lbl">Seg</span></div>
    `
  }
  update()
  setInterval(update, 1000)
}

// Cargar eventos desde Supabase
async function cargarEventos() {
  const { data, error } = await supabase.from('eventos').select('*').eq('fijo', false)
  if (error) return console.error(error)
  data.forEach(ev => {
    const fecha = new Date(ev.fecha)
    if (fecha < new Date()) fecha.setFullYear(new Date().getFullYear() + 1)
    crearCard(ev.titulo, fecha, ev.id)
  })
}

cargarEventos()

// Inicializar cumpleaños existentes
document.querySelectorAll(".countdown").forEach(el => {
  let targetDate = new Date(el.dataset.date)
  if (targetDate < new Date()) targetDate.setFullYear(new Date().getFullYear() + 1)
  iniciarCuentaAtras(el, targetDate.getTime())
})
