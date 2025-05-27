document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".nav-btn");
    const menuContainer = document.getElementById("menu-content");
  
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbwpcEWOR5wtfvM06Cc8W9eOApqWLl56O9nFLhAhnSlzhndR3zjvxAtZ1zM_GCbghNOw/exec";
    const sheetNames = [
      "Pizze", "OltreAllaPizza", "Cucina", "Bambini", 
      "Dessert", "Bevande", "Birre", "Vino", "Amari"
    ];
  
    let allMenuData = {};  // Qui memorizziamo tutti i dati una sola volta
  
    // 🔁 Carica tutte le categorie all'avvio
    async function loadAllData() {
      for (const sheet of sheetNames) {
        try {
          const res = await fetch(`${SHEET_URL}?sheet=${sheet}`);
          const data = await res.json();
          allMenuData[sheet] = data;
        } catch (err) {
          console.error(`Errore nel caricamento di ${sheet}:`, err);
          allMenuData[sheet] = [];
        }
      }
  
      renderCategory("Pizze"); // Mostra la prima categoria
    }
  
    // 👇 Stampa i dati di una categoria già in memoria
    function renderCategory(sheetName) {
        const items = allMenuData[sheetName];
        const extraInfo = document.getElementById("extra-info");
        const cucinaInfo = document.getElementById("cucina-info");
      
        // Gestione visibilità riquadri
        if (sheetName === "Pizze" || sheetName === "OltreAllaPizza") {
          extraInfo.style.display = "block";
          cucinaInfo.style.display = "none";
        } else if (sheetName === "Cucina") {
          extraInfo.style.display = "none";
          cucinaInfo.style.display = "block";
        } else {
          extraInfo.style.display = "none";
          cucinaInfo.style.display = "none";
        }
      
        if (!items || items.length === 0) {
          menuContainer.innerHTML = "<p>Nessun elemento trovato.</p>";
          return;
        }
      
        const html = items.map(item => `
          <div class="menu-item">
            <h3>${item.Nome}</h3>
            <p>${item.Ingredienti || ""}</p>
            <p><strong>€${item.Prezzo}</strong></p>
            ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
          </div>
        `).join("");
      
        menuContainer.innerHTML = html;
      }
      
      
  
    // 🔘 Clic su categoria
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const sheetName = btn.dataset.cat;
        renderCategory(sheetName);
      });
    });
  
    loadAllData(); // 🔁 Carica tutto all'avvio
  });
  