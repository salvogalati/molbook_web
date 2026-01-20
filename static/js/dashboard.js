document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll("#tabella-molecole tr[data-id]");
  const img = document.getElementById("molecola-img");
  let lastSelectedIndex = null;
  let currentIndex = 0;  // ← nuovo

  // Evento click (già in uso)...
  rows.forEach((row, index) => {
    row.addEventListener("click", (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (!isCtrl && !isShift) {
        rows.forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
      }

      if (isCtrl) {
        row.classList.toggle("selected");
      }

      if (isShift && lastSelectedIndex !== null) {
        const start = Math.min(index, lastSelectedIndex);
        const end = Math.max(index, lastSelectedIndex);
        rows.forEach((r, i) => {
          if (i >= start && i <= end) {
            r.classList.add("selected");
          }
        });
      }

      // Aggiorna immagine e indici
      const id = row.dataset.id;
      img.src = `/molecola/${id}/img/`;
      lastSelectedIndex = index;
      currentIndex = index;                  // ← sincronizza
    });
  });

  // Impostazione iniziale (opzionale)
  if (rows.length) {
    rows[0].classList.add("selected");
    img.src = `/molecola/${rows[0].dataset.id}/img/`;
    lastSelectedIndex = currentIndex = 0;
  }

  // ← Qui: listener per i tasti freccia
  document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    // rimuovo selezione corrente
    rows[currentIndex].classList.remove("selected");

    // incremento/decremento indice
    if (e.key === "ArrowDown") {
      currentIndex = (currentIndex + 1) % rows.length;
    } else {
      currentIndex = (currentIndex - 1 + rows.length) % rows.length;
    }

    // applico nuova selezione
    rows[currentIndex].classList.add("selected");
    lastSelectedIndex = currentIndex;

    // aggiorno immagine
    const id = rows[currentIndex].dataset.id;
    img.src = `/molecola/${id}/img/`;

    // scroll se necessario
    rows[currentIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});
