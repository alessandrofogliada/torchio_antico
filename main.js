
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".nav-btn");
    const menuContainer = document.getElementById("menu-content");
    const subcategoryBar = document.getElementById("subcategories-bar");
  
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbwpcEWOR5wtfvM06Cc8W9eOApqWLl56O9nFLhAhnSlzhndR3zjvxAtZ1zM_GCbghNOw/exec";
    const sheetNames = [
      "Pizze", "OltreAllaPizza", "Cucina", "Bambini",
      "Dessert", "Bevande", "Birre", "Vino", "Amari"
    ];
  
    let allMenuData = {};
  
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
      renderCategory("Pizze");
    }
  
    function renderCategory(sheetName) {
      const items = allMenuData[sheetName];
      const extraInfo = document.getElementById("extra-info");
  
      subcategoryBar.innerHTML = "";
      subcategoryBar.style.display = "none";
  
      if (sheetName === "Pizze" || sheetName === "OltreAllaPizza") {
        extraInfo.style.display = "block";
      } else {
        extraInfo.style.display = "none";
      }
  
      if (!items || items.length === 0) {
        menuContainer.innerHTML = "<p>Nessun elemento trovato.</p>";
        return;
      }
  
      let html = "";
  
      if (["OltreAllaPizza", "Cucina", "Bevande", "Birre", "Vino"].includes(sheetName)) {
        const grouped = {};
  
        items.forEach(item => {
          const cat = item.Categoria || item.Regione || "Altro";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
  
        // Mostra sottocategorie nella barra
        subcategoryBar.style.display = "flex";
        Object.keys(grouped).forEach(cat => {
          const btn = document.createElement("button");
          btn.textContent = cat;
          btn.className = "sub-btn";
          btn.addEventListener("click", () => scrollToSubcategory(cat));
          subcategoryBar.appendChild(btn);
        });
  
        for (const [subCat, subItems] of Object.entries(grouped)) {
          html += `<h2 id="cat-${subCat.replace(/\s+/g, "-")}">${subCat}</h2>`;
          html += subItems.map(item => `
            <div class="menu-item">
              <h3>${item.Nome}</h3>
              <p>${item.Ingredienti || ""}</p>
              <p><strong>€${item.Prezzo}</strong></p>
              ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
            </div>
          `).join("");
  
          if (sheetName === "OltreAllaPizza" && subCat.toLowerCase() === "piadipizze") {
            html += `
              <div class="info-box">
                <h5>🍽 Personalizza la tua piadipizza</h5>
                <p>Base Piadipizza: Mozzarella</p>
                <p><strong>€7,50</strong></p>
                <p>Puoi scegliere tra:</p>
                <ul>
                  <li>Impasto classico</li>
                  <li>Impasto integrale</li>
                  <li>Impasto carbone</li>
                </ul>
              </div>
            `;
          }
        }
  
      } else if (sheetName === "Amari") {
        html = items.map(item => `
          <div class="menu-item">
            <h3>${item.Nome}</h3>
            <p><strong>€${item.Prezzo}</strong></p>
          </div>
        `).join("");
  
      } else {
        html = items.map(item => `
          <div class="menu-item">
            <h3>${item.Nome}</h3>
            <p>${item.Ingredienti || ""}</p>
            <p><strong>€${item.Prezzo}</strong></p>
            ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
          </div>
        `).join("");
      }
  
      menuContainer.innerHTML = html;
    }
  
    function scrollToSubcategory(cat) {
      const target = document.getElementById(`cat-${cat.replace(/\s+/g, "-")}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const sheetName = btn.dataset.cat;
        renderCategory(sheetName);
      });
    });
  
    loadAllData();
  });