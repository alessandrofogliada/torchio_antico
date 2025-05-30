document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".nav-btn");
    const menuContainer = document.getElementById("menu-content");
    const subcategoryBar = document.getElementById("subcategories-bar");
  
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbwpcEWOR5wtfvM06Cc8W9eOApqWLl56O9nFLhAhnSlzhndR3zjvxAtZ1zM_GCbghNOw/exec";
    const sheetNames = [
      "Pizze", "OltreAllaPizza", "Cucina", "Bambini",
      "Dessert", "Bevande", "Birre", "Amari"
    ];
  
    let allMenuData = {};
    let currentLang = "it";
    let translations = {};
  
    // 📘 Traduzioni statiche
    async function loadTranslations(lang) {
        const res = await fetch("lang.json");
        const allLangs = await res.json();
        translations = allLangs; // ✅ salva tutto nel globale
      
        const dict = allLangs[lang] || allLangs["it"];
        document.querySelectorAll("[data-translate]").forEach(el => {
          const key = el.dataset.translate;
          if (dict[key]) el.textContent = dict[key];
        });
      }
      
  
    // 🌐 Caricamento dinamico dei dati menu
    async function loadSheet(sheetName) {
      if (allMenuData[sheetName]) return; // Già caricato
      try {
        const res = await fetch(`${SHEET_URL}?sheet=${sheetName}`);
        const data = await res.json();
        allMenuData[sheetName] = data;
      } catch (err) {
        console.error(`Errore nel caricamento di ${sheetName}:`, err);
        allMenuData[sheetName] = [];
      }
    }
  
    // 🧠 Rendering del contenuto menu
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
  
      // 🍽️ Logica generica
      const grouped = {};
      items.forEach(item => {
        const cat = item.Categoria || item.Regione || "Altro";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });
  
      const skipSubcats = ["Pizze","Antipasti", "Bambini", "Dessert", "Amari"];

        // Recupera la chiave di traduzione (es: "title_Pizze")
        const titleKey = `title_${sheetName}`;
        const translatedTitle = translations[currentLang]?.[titleKey] || "";

        // Se esiste una traduzione per quel titolo, mostrala
        if (translatedTitle) {
        html += `<h2 style="text-align: center; font-size: 45px;">${translatedTitle}</h2>`;
        }

  
      if (!skipSubcats.includes(sheetName)) {
        subcategoryBar.style.display = "flex";
        Object.keys(grouped).forEach(cat => {
            if (cat === "Altro") return;
            const btn = document.createElement("button");
          
            const subKey = `sub_${cat}`;
            const translated = translations[currentLang]?.[subKey] || cat;
          
            btn.textContent = translated;
            btn.className = "sub-btn";
            btn.addEventListener("click", () => scrollToSubcategory(cat));
            subcategoryBar.appendChild(btn);
          });
          
      }
  
      for (const [subCat, subItems] of Object.entries(grouped)) {
        const hideHeader = skipSubcats.includes(sheetName) && subCat === "Altro";
        if (!hideHeader) {
            const subKey = `sub_${subCat}`;
            const translatedSub = translations[currentLang]?.[subKey] || subCat;
            html += `<h2 style="text-align: center; font-size: 45px;" id="cat-${subCat.replace(/\s+/g, "-")}">${translatedSub}</h2>`;
          }
          
  
        html += subItems.map(item => {
          const name = item[`Nome_${currentLang}`] || item.Nome;
          const ingredients = item[`Ingredienti_${currentLang}`] || item.Ingredienti;
          const isBibitaSpina = sheetName === "Bevande" && item.Categoria?.toLowerCase() === "bibitespina";
          const isBirraSpina = sheetName === "Birre" && item.Categoria?.toLowerCase() === "birra alla spina";
  
          const prezziSpina = (isBibitaSpina || isBirraSpina) ? `
            ${item["Prezzo Piccola"] ? `<p>Piccola ${item["Prezzo Piccola"]}€</p>` : ""}
            ${item["Prezzo Media"] ? `<p>Media ${item["Prezzo Media"]}€</p>` : ""}
            ${item["Prezzo Grande"] ? `<p>Grande ${item["Prezzo Grande"]}€</p>` : ""}
          ` : `<p><strong>€${item.Prezzo}</strong></p>`;
  
          return `
            <div class="menu-item">
              <h3>${name}</h3>
              ${ingredients && !(isBibitaSpina || isBirraSpina) ? `<p>${ingredients}</p>` : ""}
              ${prezziSpina}
              ${item.Allergeni ? `<p><em>Allergeni: ${item.Allergeni}</em></p>` : ""}
            </div>
          `;
        }).join("");
  
        // Extra info
        if (sheetName === "OltreAllaPizza" && subCat.toLowerCase() === "piadipizze") {
            const ingredients = translations[currentLang]?.piadipizza_ingredients || [];
            function chunkArray(arr, size) {
                const res = [];
                for (let i = 0; i < arr.length; i += size) {
                  res.push(arr.slice(i, i + size));
                }
                return res;
              }
              
              const ingredientRows = chunkArray(ingredients, 3).map(group => `
                <div style="display: flex; width: 90%; justify-content: space-evenly; flex-wrap: nowrap; gap: 10px; margin-top: 5px;">
                  ${group.map(i => `<p style="flex: 1; text-align: center;">${i}</p>`).join("")}
                </div>
              `).join("");
              
          
              html += `
              <div class="info-box">
                <h4>${translations[currentLang]?.piadipizza_info_title || ""}</h4>
                <strong>${translations[currentLang]?.piadipizza_base || ""}</strong>
                ${ingredientRows}
              </div>
            `;            
          }
          
  
        if (sheetName === "Dessert") {
            html += `
              <div class="info-box">
                <h5>${translations[currentLang]?.dessert_info_title || ""}</h5>
                <p>${translations[currentLang]?.dessert_info_1 || ""}</p><br>
                <p>${translations[currentLang]?.dessert_info_2 || ""}</p>
              </div>
            `;
          }
          
      }
  
      menuContainer.innerHTML = html;
    }
  
    function scrollToSubcategory(cat) {
      const target = document.getElementById(`cat-${cat.replace(/\s+/g, "-")}`);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }

    function showLoader() {
        document.getElementById("loader").style.display = "block";
        menuContainer.style.display = "none";
      }
      
      function hideLoader() {
        document.getElementById("loader").style.display = "none";
        menuContainer.style.display = "block";
      }
      
  
    // 🖱️ Gestione cambio lingua
    document.getElementById("language-select").addEventListener("change", async (e) => {
        e.preventDefault();
      currentLang = e.target.value;
      await loadTranslations(currentLang);
      const activeSheet = document.querySelector(".nav-btn.active")?.dataset.cat || "Pizze";
      showLoader();
      await loadSheet(activeSheet);
      renderCategory(activeSheet);
      hideLoader();
      
    });
  
    // 🎯 Gestione clic su categoria
    buttons.forEach(btn => {
        btn.addEventListener("click", async () => {
          buttons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const sheetName = btn.dataset.cat;
      
          localStorage.setItem("currentSheet", sheetName); 
      
          showLoader();
          await loadSheet(sheetName);
          renderCategory(sheetName);
          hideLoader();
        });
      });
        
      function hidePageLoader() {
        const loader = document.getElementById("page-loader");
        if (loader) loader.style.display = "none";
      }
  
    // 🚀 Avvio
    (async () => {
        await loadTranslations(currentLang);
        const savedSheet = localStorage.getItem("currentSheet") || "Pizze"; // 🟢 Usa salvato
        await loadSheet(savedSheet);
        const activeBtn = document.querySelector(`.nav-btn[data-cat="${savedSheet}"]`);
        if (activeBtn) activeBtn.classList.add("active");
        renderCategory(savedSheet);
        hidePageLoader()
      })();
      
  });
  