// galeria.js
import { supabase, currentPlayerName } from "./auth.js";

const galeriaGrid = document.getElementById("galeria-grid");
const formUpload = document.getElementById("form-upload");
const fileInput = document.getElementById("uploadFile");      // ⬅ corregido id
const descriptionInput = document.getElementById("description-input");
const uploadStatus = document.getElementById("upload-status");

// Modal
let modalEl, modalImgEl, modalVideoEl, modalDeleteBtn;

// Estado de la galería para el modal
let mediaItems = [];        // [{...item, publicUrl}]
let currentIndex = -1;

// Estado para doble toque
let lastTapTime = 0;

// Estado para swipe
let touchStartX = null;
const SWIPE_THRESHOLD = 50; // píxeles

document.addEventListener("DOMContentLoaded", () => {
  cargarGaleria();

  const who = currentPlayerName();
  const submitBtn = formUpload.querySelector('button[type="submit"]');

  if (!who) {
    uploadStatus.textContent = "Inicia sesión para poder subir recuerdos 💌";
    submitBtn.disabled = true;
  } else {
    uploadStatus.textContent = "";
    submitBtn.disabled = false;
  }

  formUpload.addEventListener("submit", async (e) => {
    e.preventDefault();
    await subirArchivo();
  });

  // Referencias al modal
  modalEl = document.getElementById("media-modal");
  modalImgEl = document.getElementById("modal-img");
  modalVideoEl = document.getElementById("modal-video");
  const closeBtn = document.getElementById("media-close");
  modalDeleteBtn = document.getElementById("modal-delete");

  if (modalEl && closeBtn && modalImgEl && modalVideoEl) {
    // Cerrar con la X
    closeBtn.addEventListener("click", closeMediaModal);

    // Cerrar clicando fuera del contenido
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) {
        closeMediaModal();
      }
    });

    // Doble clic / doble toque para zoom
    [modalImgEl, modalVideoEl].forEach((el) => {
      el.addEventListener("click", onModalMediaClick);
    });

    // Swipe en móvil
    modalEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    modalEl.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Navegación con teclado
    document.addEventListener("keydown", (e) => {
      if (!isModalOpen()) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        showNextMedia();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrevMedia();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeMediaModal();
      }
    });
  }

  // 🔥 Botón de borrar SOLO en el modal
  if (modalDeleteBtn) {
    modalDeleteBtn.addEventListener("click", async () => {
      if (!isModalOpen() || currentIndex === -1) return;

      const who = currentPlayerName();
      if (!who) {
        alert("Inicia sesión para poder eliminar recuerdos.");
        return;
      }

      const confirmar = confirm("¿Seguro que quieres eliminar este recuerdo?");
      if (!confirmar) return;

      modalDeleteBtn.disabled = true;

      try {
        await eliminarMedia(currentIndex);
        closeMediaModal();
        await cargarGaleria();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el recuerdo. Inténtalo de nuevo.");
      } finally {
        modalDeleteBtn.disabled = false;
      }
    });
  }
});

async function subirArchivo() {
  const who = currentPlayerName(); // 'angel' | 'lily' | null

  if (!who) {
    uploadStatus.textContent =
      "Inicia sesión como Ángel o Lily para subir recuerdos 🗝️";
    setTimeout(() => (uploadStatus.textContent = ""), 2500);
    return;
  }

  const file = fileInput.files[0];
  if (!file) return;

  uploadStatus.textContent = "Subiendo archivo...";

  try {
    // 1) Ruta dentro del bucket
    const ext = file.name.split(".").pop();
    const timestamp = Date.now();
    const carpeta = new Date().toISOString().slice(0, 10); // ej: 2025-12-11
    const filePath = `${who}/${carpeta}/${timestamp}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    // 2) Subir al bucket "galeria"
    const { error: storageError } = await supabase.storage
      .from("galeria")
      .upload(filePath, file);

    if (storageError) throw storageError;

    // 3) Tipo de archivo
    const mime = file.type || "";
    let fileType = "other";
    if (mime.startsWith("image/")) fileType = "image";
    else if (mime.startsWith("video/")) fileType = "video"; 

    // 4) Guardar registro en la tabla
    const description = descriptionInput.value.trim() || null;

    const { error: dbError } = await supabase.from("media_galeria").insert({
      file_path: filePath,
      file_type: fileType,
      description,
    });

    if (dbError) throw dbError;

    uploadStatus.textContent = "Subido ✅";
    fileInput.value = "";
    descriptionInput.value = "";

    const span = document.getElementById("fileName");
    if (span) span.textContent = "Ningún archivo seleccionado";

    await cargarGaleria();
  } catch (err) {
    console.error(err);
    uploadStatus.textContent = "Error al subir. Inténtalo de nuevo.";
  } finally {
    setTimeout(() => (uploadStatus.textContent = ""), 2000);
  }
}

async function cargarGaleria() {
  galeriaGrid.innerHTML = "<p>Cargando recuerdos...</p>";

  const { data, error } = await supabase
    .from("media_galeria")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    galeriaGrid.innerHTML = "<p>Error al cargar la galería.</p>";
    return;
  }

  if (!data || data.length === 0) {
    galeriaGrid.innerHTML =
      "<p>Aún no hay recuerdos. ¡Sube el primero! 💖</p>";
    mediaItems = [];
    return;
  }

  galeriaGrid.innerHTML = "";

  // Preparamos mediaItems con la URL pública incluida
  mediaItems = data.map((item) => {
    const { data: publicUrlData } = supabase.storage
      .from("galeria")
      .getPublicUrl(item.file_path);

    return {
      ...item,
      publicUrl: publicUrlData.publicUrl,
    };
  });

  mediaItems.forEach((item, index) => {
    const card = crearTarjetaMedia(item, index);
    galeriaGrid.appendChild(card);
  });
}

function crearTarjetaMedia(item, index) {
  const card = document.createElement("article");
  card.className = "galeria-card";

  const url = item.publicUrl;
  let mediaEl;

  if (item.file_type === "image") {
    mediaEl = document.createElement("img");
    mediaEl.src = url;
    mediaEl.alt = item.description || "Imagen de la galería";
    mediaEl.loading = "lazy";
    mediaEl.addEventListener("click", () => openMediaModal(index));
  } else if (item.file_type === "video") {
    mediaEl = document.createElement("video");
    mediaEl.src = url;

    // Miniatura sin controles
    mediaEl.muted = true;
    mediaEl.playsInline = true;
    mediaEl.controls = false;
    mediaEl.classList.add("galeria-video-thumb");

    mediaEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMediaModal(index);
    });
  } else {
    mediaEl = document.createElement("a");
    mediaEl.href = url;
    mediaEl.target = "_blank";
    mediaEl.rel = "noopener noreferrer";
    mediaEl.textContent = "Ver archivo";
  }

  const info = document.createElement("div");
  info.className = "galeria-card-info";

  const desc = document.createElement("p");
  desc.className = "galeria-desc";
  desc.textContent = item.description || "";

  const fecha = document.createElement("span");
  fecha.className = "galeria-fecha";
  const date = new Date(item.created_at);
  fecha.textContent = date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  info.appendChild(desc);
  info.appendChild(fecha);

  card.appendChild(mediaEl);
  card.appendChild(info);

  return card;
}

/* ===========================
   MODAL FULLSCREEN + SLIDER
   =========================== */

function openMediaModal(index) {
  if (!modalEl || !modalImgEl || !modalVideoEl) return;
  if (!mediaItems || mediaItems.length === 0) return;

  currentIndex = index;

  const item = mediaItems[index];
  if (!item) return;

  // Reset zoom
  modalImgEl.classList.remove("zoomed");
  modalVideoEl.classList.remove("zoomed");
  modalImgEl.style.transformOrigin = "center center";
  modalVideoEl.style.transformOrigin = "center center";

  // Ocultamos ambos inicialmente
  modalImgEl.style.display = "none";
  modalVideoEl.style.display = "none";
  modalVideoEl.pause();
  modalVideoEl.removeAttribute("src");
  modalImgEl.removeAttribute("src");

  if (item.file_type === "image") {
    modalImgEl.src = item.publicUrl;
    modalImgEl.style.display = "block";
  } else if (item.file_type === "video") {
    modalVideoEl.src = item.publicUrl;
    modalVideoEl.style.display = "block";
  }

  modalEl.classList.add("show");
}

function closeMediaModal() {
  if (!modalEl || !modalImgEl || !modalVideoEl) return;

  modalEl.classList.remove("show");

  modalVideoEl.pause();
  modalVideoEl.removeAttribute("src");
  modalImgEl.removeAttribute("src");

  currentIndex = -1;
}

function isModalOpen() {
  return modalEl && modalEl.classList.contains("show");
}

function showNextMedia() {
  if (!isModalOpen() || mediaItems.length === 0) return;
  const nextIndex = (currentIndex + 1) % mediaItems.length;
  openMediaModal(nextIndex);
}

function showPrevMedia() {
  if (!isModalOpen() || mediaItems.length === 0) return;
  const prevIndex =
    (currentIndex - 1 + mediaItems.length) % mediaItems.length;
  openMediaModal(prevIndex);
}

/* ===========================
   ELIMINAR MEDIA DESDE MODAL
   =========================== */

async function eliminarMedia(index) {
  const item = mediaItems[index];
  if (!item) return;

  // 1) Borrar fichero del bucket
  const { error: storageError } = await supabase.storage
    .from("galeria")
    .remove([item.file_path]);

  if (storageError) throw storageError;

  // 2) Borrar registro en la tabla
  const { error: dbError } = await supabase
    .from("media_galeria")
    .delete()
    .eq("id", item.id);

  if (dbError) throw dbError;
}

/* ===========================
   DOBLE TOQUE / ZOOM
   =========================== */

function onModalMediaClick(e) {
  if (!isModalOpen()) return;

  const now = Date.now();
  const delta = now - lastTapTime;

  if (delta < 300) {
    // Doble toque / doble clic
    toggleZoom(e);
    lastTapTime = 0;
  } else {
    lastTapTime = now;
  }
}

function toggleZoom(e) {
  const target =
    modalImgEl.style.display === "block" ? modalImgEl : modalVideoEl;

  if (!target) return;

  if (!target.classList.contains("zoomed")) {
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const originX = (x / rect.width) * 100;
    const originY = (y / rect.height) * 100;

    target.style.transformOrigin = `${originX}% ${originY}%`;
    target.classList.add("zoomed");
  } else {
    target.classList.remove("zoomed");
    target.style.transformOrigin = "center center";
  }
}

/* ===========================
   SWIPE PARA CAMBIAR DE MEDIA
   =========================== */

function handleTouchStart(e) {
  if (!isModalOpen()) return;
  if (!e.touches || e.touches.length === 0) return;
  touchStartX = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  if (!isModalOpen()) return;
  if (touchStartX === null) return;

  const endX = e.changedTouches[0].clientX;
  const diffX = endX - touchStartX;

  if (Math.abs(diffX) > SWIPE_THRESHOLD) {
    if (diffX < 0) {
      showNextMedia();
    } else {
      showPrevMedia();
    }
  }

  touchStartX = null;
}

/* ===========================
   NOMBRE DEL ARCHIVO SELECCIONADO
   =========================== */

document.getElementById("uploadFile").addEventListener("change", function () {
  const span = document.getElementById("fileName");
  if (this.files.length > 0) {
    span.textContent = this.files[0].name;
  } else {
    span.textContent = "Ningún archivo seleccionado";
  }
});