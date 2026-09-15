/* ==========================================================================
   FISO GALLERY - Artwork Catalog & Filter Module (catalog.js)
   ========================================================================== */

let currentProducts = [];
let activeFilters = {
  search: "",
  category: "All",
  medium: "All",
  region: "All",
  maxPrice: 500000,
  sort: "featured",
};

document.addEventListener("DOMContentLoaded", () => {
  parseUrlParams();
  loadFilterMetadata();
  fetchProducts();
  setupFilterEventListeners();

  document.addEventListener("currencyChange", () => {
    renderProductGrid(currentProducts);
  });
});

// Read URL parameters on load (e.g. ?category=Modern+Miniature)
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("category")) activeFilters.category = params.get("category");
  if (params.has("region")) activeFilters.region = params.get("region");
  if (params.has("search")) activeFilters.search = params.get("search");

  const searchInput = document.getElementById("catalog-search-input");
  if (searchInput && activeFilters.search) {
    searchInput.value = activeFilters.search;
  }
}

// Fetch Filter Metadata (available categories, regions, mediums)
async function loadFilterMetadata() {
  try {
    const res = await fetch("/api/products/meta/filters");
    const data = await res.json();
    if (data.success) {
      renderCategoryFilters(data.filters.categories);
      renderRegionFilters(data.filters.regions);
    }
  } catch (err) {
    console.error("Failed to load filter metadata:", err);
  }
}

function renderCategoryFilters(categories) {
  const container = document.getElementById("category-filter-list");
  if (!container) return;

  const allItems = ["All", ...categories];
  container.innerHTML = allItems.map(cat => {
    const isChecked = activeFilters.category === cat ? "checked" : "";
    return `
      <label class="filter-item ${isChecked ? 'active' : ''}">
        <input type="radio" name="categoryFilter" value="${cat}" ${isChecked}>
        <span>${cat}</span>
      </label>
    `;
  }).join("");

  container.querySelectorAll('input[name="categoryFilter"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      activeFilters.category = e.target.value;
      fetchProducts();
    });
  });
}

function renderRegionFilters(regions) {
  const container = document.getElementById("region-filter-list");
  if (!container) return;

  const allRegions = ["All", ...regions];
  container.innerHTML = allRegions.map(reg => {
    const isChecked = activeFilters.region === reg ? "checked" : "";
    return `
      <label class="filter-item ${isChecked ? 'active' : ''}">
        <input type="radio" name="regionFilter" value="${reg}" ${isChecked}>
        <span>${reg}</span>
      </label>
    `;
  }).join("");

  container.querySelectorAll('input[name="regionFilter"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      activeFilters.region = e.target.value;
      fetchProducts();
    });
  });
}

// Fetch products based on active filters
async function fetchProducts() {
  const grid = document.getElementById("catalog-artworks-grid");
  const countEl = document.getElementById("catalog-count");
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
    <p style="font-family: var(--font-serif); font-size: 1.5rem; color: #FFF;">Retrieving Pakistani Masterpieces...</p>
  </div>`;

  const queryParams = new URLSearchParams();
  if (activeFilters.search) queryParams.append("search", activeFilters.search);
  if (activeFilters.category && activeFilters.category !== "All") queryParams.append("category", activeFilters.category);
  if (activeFilters.medium && activeFilters.medium !== "All") queryParams.append("medium", activeFilters.medium);
  if (activeFilters.region && activeFilters.region !== "All") queryParams.append("region", activeFilters.region);
  if (activeFilters.maxPrice) queryParams.append("maxPrice", activeFilters.maxPrice);
  if (activeFilters.sort) queryParams.append("sort", activeFilters.sort);

  try {
    const res = await fetch(`/api/products?${queryParams.toString()}`);
    const data = await res.json();

    if (data.success) {
      currentProducts = data.products;
      if (countEl) countEl.textContent = `Showing ${data.count} ${data.count === 1 ? 'artwork' : 'curated artworks'}`;
      renderProductGrid(data.products);
    }
  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem 0; color: #EF4444;">Unable to load artworks. Please check your server connection.</div>`;
  }
}

// Render grid cards
function renderProductGrid(products) {
  const grid = document.getElementById("catalog-artworks-grid");
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 5rem 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-color);">
        <p style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 0.75rem;">No artworks match your criteria.</p>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try adjusting your price range, medium, or regional filter.</p>
        <button class="btn btn-outline btn-sm" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  const userFavs = (window.FISO.user && window.FISO.user.favorites) || [];

  grid.innerHTML = products.map(art => {
    const isFav = userFavs.includes(art.id);
    return `
      <div class="art-card">
        <div class="art-thumb-wrap">
          <a href="/product.html?id=${art.id}">
            <img src="${art.imageUrl}" alt="${art.title}" loading="lazy" />
          </a>
          <button class="fav-btn ${isFav ? 'favorited' : ''}" onclick="window.FISO.toggleFavoriteArtwork(${art.id}, this)" title="Save to private Collector Shortlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div class="art-info">
          <div class="art-meta-row">
            <span class="art-category">${art.category}</span>
            <span class="art-region">${art.region} &bull; ${art.year}</span>
          </div>
          <a href="/product.html?id=${art.id}">
            <h3 class="art-title">${art.title}</h3>
          </a>
          <p class="art-artist">${art.artist}</p>
          <div class="art-medium-specs">
            ${art.medium}<br>
            <span style="color: #A3A3A3; font-size: 0.8rem;">${art.dimensions}</span>
          </div>
          <div class="art-footer">
            <div class="art-price-wrap">
              <span class="art-price-label">Acquisition Price</span>
              <span class="art-price-val">${window.FISO.formatPrice(art.pricePkr, art.priceUsd)}</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick='window.FISO.addItemToCart(${JSON.stringify(art).replace(/'/g, "&apos;")})'>
              Acquire
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Setup Event Listeners
function setupFilterEventListeners() {
  const searchInput = document.getElementById("catalog-search-input");
  const searchBtn = document.getElementById("catalog-search-btn");
  const priceSlider = document.getElementById("price-slider");
  const priceSliderVal = document.getElementById("price-slider-val");
  const sortSelect = document.getElementById("catalog-sort-select");

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        activeFilters.search = searchInput.value.trim();
        fetchProducts();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      activeFilters.search = searchInput.value.trim();
      fetchProducts();
    });
  }

  if (priceSlider) {
    priceSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      activeFilters.maxPrice = val;
      if (priceSliderVal) {
        priceSliderVal.textContent = window.FISO.formatPrice(val, Math.round(val / 280));
      }
    });
    priceSlider.addEventListener("change", () => {
      fetchProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      activeFilters.sort = e.target.value;
      fetchProducts();
    });
  }
}

function resetFilters() {
  activeFilters = {
    search: "",
    category: "All",
    medium: "All",
    region: "All",
    maxPrice: 500000,
    sort: "featured",
  };
  const searchInput = document.getElementById("catalog-search-input");
  if (searchInput) searchInput.value = "";
  const priceSlider = document.getElementById("price-slider");
  if (priceSlider) priceSlider.value = 500000;
  loadFilterMetadata();
  fetchProducts();
}
window.resetFilters = resetFilters;