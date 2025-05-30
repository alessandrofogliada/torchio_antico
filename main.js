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
      
        extraInfo.style.display = ["Pizze", "OltreAllaPizza"].includes(sheetName) ? "block" : "none";
      
        if (!items || items.length === 0) {
          menuContainer.innerHTML = "<p>Nessun elemento trovato.</p>";
          return;
        }
      
        let html = "";
      
        // --- GESTIONE SPECIALE PER IL VINO ---
        if (sheetName === "Vino") {
          const grouped = {};
      
          items.forEach(item => {
            const region = item.Regione || "Altre Regioni";
            const type = item.Categoria || "Altro";
            if (!grouped[region]) grouped[region] = {};
            if (!grouped[region][type]) grouped[region][type] = [];
            grouped[region][type].push(item);
          });
      
          for (const [region, types] of Object.entries(grouped)) {
            html += `<h2 style="text-align: center;font-size: 45px;background-color:#7d0a0a;color: white;width: 80%;margin: 30px auto;min-height: 85px;padding-top: 20px;">${region}</h2>`;
            for (const [type, wines] of Object.entries(types)) {
              html += `<h3 style="text-align: center; font-size: 40px;" >${type}</h3>`;
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
      
          menuContainer.innerHTML = html;
          return; // ← IMPORTANTE: impedisce che passi alla logica generica
        }
      
        // --- LOGICA GENERICA PER LE ALTRE CATEGORIE ---
        const grouped = {};
        items.forEach(item => {
          const cat = item.Categoria || item.Regione || "Altro";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
      
        const skipSubcats = ["Pizze", "Bambini", "Dessert" ,"Amari"];
        const customTitles = {
          "Pizze": "Le nostre pizze",
          "Bambini": "Per i Vostri Bambini",
          "Dessert": "Dessert",
          "Amari": "I nostri Amari",
        };
      
        const showFixedTitle = customTitles[sheetName];
        if (showFixedTitle) {
          html += `<h2 style="text-align: center; font-size: 45px;">${showFixedTitle}</h2>`;
        }
      
        if (!skipSubcats.includes(sheetName)) {
          subcategoryBar.style.display = "flex";
          Object.keys(grouped).forEach(cat => {
            if (cat === "Altro") return;
            const btn = document.createElement("button");
            btn.textContent = cat;
            btn.className = "sub-btn";
            btn.addEventListener("click", () => scrollToSubcategory(cat));
            subcategoryBar.appendChild(btn);
          });
        }
      
        for (const [subCat, subItems] of Object.entries(grouped)) {
          const hideHeader = skipSubcats.includes(sheetName) && subCat === "Altro";
          if (!hideHeader) {
            html += `<h2 style="text-align: center; font-size: 45px;" id="cat-${subCat.replace(/\s+/g, "-")}" >${subCat}</h2>`;
          }
      
          html += subItems.map(item => {
            const isBibitaSpina = sheetName === "Bevande" && item.Categoria?.toLowerCase() === "bibitespina";
            const isBirraSpina = sheetName === "Birre" && item.Categoria?.toLowerCase() === "birra alla spina";
      
            const prezziSpina = (isBibitaSpina || isBirraSpina) ? `
              ${item["Prezzo Piccola"] ? `<p>Piccola ${item["Prezzo Piccola"]}€</p>` : ""}
              ${item["Prezzo Media"] ? `<p>Media ${item["Prezzo Media"]}€</p>` : ""}
              ${item["Prezzo Grande"] ? `<p>Grande ${item["Prezzo Grande"]}€</p>` : ""}
            ` : `<p><strong>€${item.Prezzo}</strong></p>`;
      
            return `
              <div class="menu-item">
                <h3>${item.Nome}</h3>
                ${item.Ingredienti && !(isBibitaSpina || isBirraSpina) ? `<p>${item.Ingredienti}</p>` : ""}
                ${prezziSpina}
                ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
              </div>
            `;
          }).join("");
      
          // Blocchi extra sotto specifici gruppi
          if (sheetName === "OltreAllaPizza" && subCat.toLowerCase() === "piadipizze") {
            html += `
              <div class="info-box">
                <h5>ℹ️Personalizza la tua piadipizza partendo dalla base</h5>
                <p>- Piadipizza base (Impasto + Mozzarella) 7,50€</p>
                <div style="display:flex;width: 90%;justify-content: space-evenly;">
                    <p>ingediente</p>
                    <p>ingediente</p>
                    <p>ingediente</p>
                    <p>ingediente</p>
                </div>

                <div style="display:flex;width: 90%;justify-content: space-evenly;">
                    <p>ingediente</p>
                    <p>ingediente</p>
                    <p>ingediente</p>
                    <p>ingediente</p>                 

                </div>

                <div style="display:flex;width: 90%;justify-content: space-evenly;">
                    <p>ingediente</p>
                    <p>ingediente</p>
                    <p>ingediente</p>
                    <p>ingediente</p>
                </div>
              </div>
            `;
          }
      
          if (sheetName === "Dessert") {
            html += `
              <div class="info-box">
                <h5>🍰 Possibilità di aggiunta:</h5>
                <p>- Panna montata (+1€)</p>
                <br>
                <p>- Topping: cioccolato, caramello, frutti di bosco</p>
              </div>
            `;
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
  