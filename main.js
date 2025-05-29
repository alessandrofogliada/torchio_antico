
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
      
        if (sheetName === "Birre") {
          const grouped = {};
      
          items.forEach(item => {
            const cat = item.Categoria || "Altro";
            const sub = item.Sottocategoria || "Varietà";
            if (!grouped[cat]) grouped[cat] = {};
            if (!grouped[cat][sub]) grouped[cat][sub] = [];
            grouped[cat][sub].push(item);
          });
      
          for (const [cat, subgroups] of Object.entries(grouped)) {
            html += `<h2>${cat}</h2>`;
            for (const [subCat, subItems] of Object.entries(subgroups)) {
              html += `<h3>${subCat}</h3>`;
              html += subItems.map(item => {
                let pricesHTML = "";
      
                if (cat.toLowerCase() === "birra alla spina") {
                  if (item["Prezzo Piccola"]) {
                    pricesHTML += `<p>Piccola €${item["Prezzo Piccola"]}</p>`;
                  }
                  if (item["Prezzo Media"]) {
                    pricesHTML += `<p>Media €${item["Prezzo Media"]}</p>`;
                  }
                } else {
                  pricesHTML = item.Prezzo ? `<p><strong>€${item.Prezzo}</strong></p>` : "";
                }
      
                return `
                  <div class="menu-item">
                    <h3>${item.Nome}</h3>
                    ${item.Ingredienti ? `<p>${item.Ingredienti}</p>` : ""}
                    ${pricesHTML}
                    ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
                  </div>
                `;
              }).join("");
            }
          }
      
        } else if (sheetName === "Vino") {
          const grouped = {};
      
          items.forEach(item => {
            const region = item.Regione || "Altre Regioni";
            const type = item.Categoria || "Altro";
            if (!grouped[region]) grouped[region] = {};
            if (!grouped[region][type]) grouped[region][type] = [];
            grouped[region][type].push(item);
          });
      
          for (const [region, types] of Object.entries(grouped)) {
            html += `<h2>${region}</h2>`;
            for (const [type, wines] of Object.entries(types)) {
              html += `<h3>${type}</h3>`;
              html += wines.map(item => `
                <div class="menu-item">
                  <h3>${item.Nome}</h3>
                  ${item.Cantina ? `<p>${item.Cantina}</p>` : ""}
                  ${item.Ingredienti ? `<p>${item.Ingredienti}</p>` : ""}
                  <p><strong>€${item.Prezzo}</strong></p>
                  ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
                </div>
              `).join("");
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
          const grouped = {};
      
          items.forEach(item => {
            const cat = item.Categoria || item.Regione || "Altro";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
          });
      
          subcategoryBar.style.display = "flex";
          Object.keys(grouped).forEach(cat => {
            
            if (["Pizze", "Bambini", "Dessert"].includes(sheetName) && cat === "Altro") return;

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
          }
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