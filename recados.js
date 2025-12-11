// Usamos el cliente compartido desde auth.js
import { supabase } from "./auth.js";

// === Cargar recados al iniciar ===
window.addEventListener("DOMContentLoaded", async () => {
  await cargarRecados("Angel", "recados-angel");
  await cargarRecados("Lily", "recados-lily");
});

// === Función para cargar recados según el nombre ===
async function cargarRecados(nombre, contenedorId) {
  const { data, error } = await supabase
    .from("recados")
    .select("*")
    .eq("nombre", nombre)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al cargar recados:", error);
    return;
  }

  const lista = document.getElementById(contenedorId);
  lista.innerHTML = "";

  data.forEach((recado) => {
    const li = document.createElement("li");
    li.className = `recado-item ${recado.completado ? "completed" : ""}`;
    li.innerHTML = `
      <label>
        <input type="checkbox" ${recado.completado ? "checked" : ""}>
        <span>${recado.texto}</span>
      </label>
      <button class="delete-recado material-symbols-outlined">delete</button>
    `;

    // Evento para marcar/desmarcar
    li.querySelector("input").addEventListener("change", async (e) => {
      const nuevoEstado = e.target.checked;
      await supabase
        .from("recados")
        .update({ completado: nuevoEstado })
        .eq("id", recado.id);

      li.classList.toggle("completed", nuevoEstado);
    });

    // Evento para eliminar recado
    li.querySelector(".delete-recado").addEventListener("click", async () => {
      const { error } = await supabase
        .from("recados")
        .delete()
        .eq("id", recado.id);
      if (error) {
        console.error("Error al eliminar recado:", error);
        alert("No se pudo eliminar el recado");
      } else {
        li.remove();
      }
    });

    lista.appendChild(li);
  });
}

// === Popup abrir/cerrar ===
document.getElementById("open-add-recado").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("recado-popup").classList.remove("hidden");
});

document.getElementById("close-popup").addEventListener("click", () => {
  document.getElementById("recado-popup").classList.add("hidden");
});

// === Añadir recado dinámico ===
document.getElementById("add-recado-btn").addEventListener("click", async () => {
  const user = document.getElementById("recado-user").value;
  const texto = document.getElementById("recado-text").value.trim();

  if (!user || !texto) {
    alert("Por favor selecciona una persona y escribe el recado");
    return;
  }

  // Insertar en Supabase
  const { error } = await supabase
    .from("recados")
    .insert([{ nombre: user, texto: texto, completado: false }]);

  if (error) {
    console.error("Error al guardar recado:", error);
    alert("Error al guardar el recado");
    return;
  }

  // Recargar lista de la persona correspondiente
  await cargarRecados(user, user === "Angel" ? "recados-angel" : "recados-lily");

  // Limpiar formulario
  document.getElementById("recado-user").value = "";
  document.getElementById("recado-text").value = "";
  document.getElementById("recado-popup").classList.add("hidden");
});
