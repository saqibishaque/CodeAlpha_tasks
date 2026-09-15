/* ==========================================================================
   FISO GALLERY - Artwork Detail & Wall View Simulator (product.js)
   ========================================================================== */

let currentArtwork = null;

document.addEventListener("DOMContentLoaded", () => {
  loadArtworkDetails();
  initNarrativeTabs();
  initWallSimulatorModal();

  document.addEventListener("currencyChange", () => {
    if (currentArtwork) updatePricingDisplay(currentArtwork);
  });
});

async function loadArtworkDetails() {
  const params = new URLSearchParams(window.location.search);
  const artworkId = params.get("id") || "1";

  try {
    const res = await fetch(`/api/products/${artworkId}`);
    const data = await res.json();

    if (!data.success || !data.product) {
      document.getElementById("product-detail-container").innerHTML = `
        <div style="text-align: center; padding: 6rem 0;">
          <h2>Artwork Not Found</h2>
          <p style="color: var(--text-muted); margin: 1rem 0 2rem;">The requested piece may have been archived or privatized.</p>
          <a href="/catalog.html" class="btn btn-primary">Return to Catalog</a>
        </div>
      `;
      return;
    }

    currentArtwork = data.product;
    renderArtworkPage(data.product, data.related);
  } catch (err) {
    console.error("Error loading artwork:", err);
  }
}

function renderArtworkPage(art, related) {
  // Page Title
  document.title = `${art.title} by ${art.artist} | FISO Gallery`;

  // Visuals
  const mainImg = document.getElementById("art-main-image");
  if (mainImg) {
    mainImg.src = art.imageUrl;
    mainImg.alt = art.title;
  }

  // Header & Info
  document.getElementById("art-category-badge").textContent = art.category;
  document.getElementById("art-region-badge").textContent = `${art.region}, Pakistan ${art.year}`;
  document.getElementById("art-title-heading").textContent = art.title;
  document.getElementById("art-artist-name").textContent = art.artist;

  // Pricing
  updatePricingDisplay(art);

  // Tabs Content
  document.getElementById("tab-about").innerHTML = `
    <p style="margin-bottom: 1.25rem;">${art.aboutPiece}</p>
    <div style="background: var(--bg-surface-elevated); padding: 1.25rem; border-left: 2px solid var(--accent-yellow); margin-top: 1.5rem;">
      <h5 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-yellow); margin-bottom: 0.4rem;">Artist Biography</h5>
      <p style="font-size: 0.9rem; color: #BBB;">${art.artistBio || 'Prominent Pakistani contemporary artist.'}</p>
    </div>
  `;

  document.getElementById("tab-critique").innerHTML = `
    <div class="critical-pullquote">"${art.criticalStatement}"</div>
    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 1rem;">
      <strong>Curatorial Context:</strong> This piece was curated specifically for FISO's permanent dialogue on Pakistani contemporary identity and socio-cultural geography.
    </p>
  `;

  document.getElementById("tab-specs").innerHTML = `
    <table class="specs-table">
      <tr><td>Medium & Technique</td><td>${art.medium}</td></tr>
      <tr><td>Dimensions</td><td>${art.dimensions}</td></tr>
      <tr><td>Year of Creation</td><td>${art.year}</td></tr>
      <tr><td>Origin & Region</td><td>${art.region}, Pakistan</td></tr>
      <tr><td>Framing & Presentation</td><td>${art.framingStatus}</td></tr>
      <tr><td>Provenance & Archive</td><td>${art.provenance || 'FISO Curatorial Direct Provenance'}</td></tr>
      <tr><td>Authenticity</td><td>Accompanied by Gallery Certificate of Authenticity & QR Ledger</td></tr>
    </table>
  `;

  // Action Buttons
  const acquireBtn = document.getElementById("art-acquire-btn");
  if (acquireBtn) {
    acquireBtn.onclick = () => window.FISO.addItemToCart(art);
  }

  const favBtn = document.getElementById("art-fav-btn");
  if (favBtn) {
    const userFavs = (window.FISO.user && window.FISO.user.favorites) || [];
    favBtn.classList.toggle("favorited", userFavs.includes(art.id));
    favBtn.onclick = () => window.FISO.toggleFavoriteArtwork(art.id, favBtn);
  }

  // Wall Simulator Trigger
  const wallBtn = document.getElementById("open-wall-modal-btn");
  if (wallBtn) {
    wallBtn.onclick = () => openWallSimulator(art);
  }

  // Related Works
  renderRelatedWorks(related);
}

function updatePricingDisplay(art) {
  const priceEl = document.getElementById("art-price-val");
  if (priceEl) {
    priceEl.textContent = window.FISO.formatPrice(art.pricePkr, art.priceUsd);
  }
}

// Narrative Tab Switcher
function initNarrativeTabs() {
  const tabBtns = document.querySelectorAll(".narrative-tabs .tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });
}

// Wall View Simulator Modal
function initWallSimulatorModal() {
  const modal = document.getElementById("wall-modal");
  const closeBtn = document.getElementById("close-wall-modal");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open"));
    });
  }
}

function openWallSimulator(art) {
  const modal = document.getElementById("wall-modal");
  const wallImg = document.getElementById("wall-modal-img");
  const scaleText = document.getElementById("wall-scale-text");
  const wallTitle = document.getElementById("wall-modal-title");

  if (wallImg) wallImg.src = art.imageUrl;
  if (scaleText) scaleText.textContent = `Scaled Dimensions: ${art.dimensions}`;
  if (wallTitle) wallTitle.textContent = `Simulated Gallery View: "${art.title}"`;

  if (modal) modal.classList.add("open");
}

function renderRelatedWorks(related) {
  const container = document.getElementById("related-artworks-grid");
  if (!container || !related || !related.length) return;

  container.innerHTML = related.map(art => {
    return `
      <div class="art-card">
        <div class="art-thumb-wrap">
          <a href="/product.html?id=${art.id}">
            <img src="${art.imageUrl}" alt="${art.title}" loading="lazy" />
          </a>
        </div>
        <div class="art-info">
          <span class="art-category">${art.category}</span>
          <a href="/product.html?id=${art.id}">
            <h4 class="art-title" style="font-size: 1.15rem;">${art.title}</h4>
          </a>
          <p class="art-artist">${art.artist}</p>
          <div class="art-footer" style="padding-top: 0.75rem;">
            <span class="art-price-val" style="font-size: 1.1rem;">${window.FISO.formatPrice(art.pricePkr, art.priceUsd)}</span>
            <a href="/product.html?id=${art.id}" class="btn btn-outline btn-sm">View</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}