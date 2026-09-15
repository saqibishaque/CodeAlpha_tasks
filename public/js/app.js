/* ==========================================================================
   FISO GALLERY - Core Client Application Module (app.js)
   ========================================================================== */

// Global State
window.FISO = {
  currency: localStorage.getItem("fiso_currency") || "PKR",
  exchangeRate: 280, // 1 USD = 280 PKR
  user: null,
  cart: [],
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initCurrency();
  initMobileMenu();
  initDrawerCart();
  checkAuthStatus();
  renderHeaderCartBadge();
});

// Currency Switcher
function initCurrency() {
  const pkrBtns = document.querySelectorAll(".curr-pkr");
  const usdBtns = document.querySelectorAll(".curr-usd");

  function setCurrency(curr) {
    window.FISO.currency = curr;
    localStorage.setItem("fiso_currency", curr);

    pkrBtns.forEach(b => b.classList.toggle("active", curr === "PKR"));
    usdBtns.forEach(b => b.classList.toggle("active", curr === "USD"));

    // Trigger custom event so all pages re-render prices seamlessly
    document.dispatchEvent(new CustomEvent("currencyChange", { detail: { currency: curr } }));
  }

  pkrBtns.forEach(b => b.addEventListener("click", () => setCurrency("PKR")));
  usdBtns.forEach(b => b.addEventListener("click", () => setCurrency("USD")));

  // Set initial active state
  setCurrency(window.FISO.currency);
}

// Format Price Helper
function formatPrice(pricePkr, priceUsd) {
  if (window.FISO.currency === "USD") {
    const val = priceUsd || Math.round(pricePkr / window.FISO.exchangeRate);
    return `$${val.toLocaleString()}`;
  }
  return `Rs. ${pricePkr.toLocaleString()}`;
}

// Mobile Nav Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
  }
}

// Slide-Over Cart Drawer Controller
function initDrawerCart() {
  const openBtns = document.querySelectorAll(".open-cart-trigger");
  const closeBtn = document.getElementById("close-cart-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const drawer = document.getElementById("cart-drawer");

  function openDrawer() {
    if (drawer && backdrop) {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      renderDrawerItems();
    }
  }

  function closeDrawer() {
    if (drawer && backdrop) {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
    }
  }

  openBtns.forEach(btn => btn.addEventListener("click", (e) => {
    e.preventDefault();
    openDrawer();
  }));

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  window.FISO.openCart = openDrawer;
  window.FISO.closeCart = closeDrawer;
}

// Render Drawer Cart Items
function renderDrawerItems() {
  const container = document.getElementById("drawer-items-list");
  const subtotalEl = document.getElementById("drawer-subtotal-val");
  if (!container) return;

  const cart = getCartFromStorage();
  window.FISO.cart = cart;
  renderHeaderCartBadge();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="drawer-empty-msg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p style="font-family: var(--font-serif); font-size: 1.25rem; color: #FFF; margin-bottom: 0.5rem;">Your collection cart is empty.</p>
        <p style="font-size: 0.85rem; color: #8E8E8E;">Explore contemporary Pakistani art pieces in our catalog.</p>
        <a href="/catalog.html" class="btn btn-primary btn-sm" style="margin-top: 1.25rem;" onclick="window.FISO.closeCart()">Explore Artworks</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0, 0);
    return;
  }

  let totalPkr = 0;
  let totalUsd = 0;

  container.innerHTML = cart.map(item => {
    const itemTotalPkr = item.pricePkr * item.quantity;
    const itemTotalUsd = item.priceUsd * item.quantity;
    totalPkr += itemTotalPkr;
    totalUsd += itemTotalUsd;

    return `
      <div class="drawer-item" data-id="${item.id}">
        <div class="drawer-item-img">
          <img src="${item.imageUrl}" alt="${item.title}" />
        </div>
        <div class="drawer-item-details">
          <h4 class="drawer-item-title">${item.title}</h4>
          <p class="drawer-item-artist">${item.artist}</p>
          <p class="drawer-item-price">${formatPrice(item.pricePkr, item.priceUsd)}</p>
          <div class="drawer-qty-controls">
            <button class="qty-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
            <button class="drawer-item-remove" onclick="removeItemFromCart(${item.id})">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (subtotalEl) {
    subtotalEl.textContent = formatPrice(totalPkr, totalUsd);
  }
}

// Cart Storage Helpers
function getCartFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("fiso_cart")) || [];
  } catch (e) {
    return [];
  }
}

function saveCartToStorage(cart) {
  localStorage.setItem("fiso_cart", JSON.stringify(cart));
  window.FISO.cart = cart;
  renderHeaderCartBadge();
  renderDrawerItems();
  document.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart } }));
}

function addItemToCart(product, quantity = 1) {
  let cart = getCartFromStorage();
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      artist: product.artist,
      medium: product.medium,
      pricePkr: product.pricePkr,
      priceUsd: product.priceUsd,
      imageUrl: product.imageUrl,
      quantity: quantity,
    });
  }

  saveCartToStorage(cart);
  showToast(`Added "${product.title}" to your Collection Cart.`);
  if (window.FISO.openCart) window.FISO.openCart();
}

function updateItemQuantity(productId, newQty) {
  let cart = getCartFromStorage();
  if (newQty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  } else {
    const item = cart.find(i => i.id === productId);
    if (item) item.quantity = newQty;
  }
  saveCartToStorage(cart);
}

function removeItemFromCart(productId) {
  let cart = getCartFromStorage();
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage(cart);
  showToast("Artwork removed from your cart.");
}

function renderHeaderCartBadge() {
  const badges = document.querySelectorAll(".cart-badge");
  const cart = getCartFromStorage();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? "flex" : "none";
  });
}

// Check Authentication Status
async function checkAuthStatus() {
  const token = localStorage.getItem("fiso_token");
  const authLink = document.getElementById("nav-auth-link");
  const mobileAuthLink = document.getElementById("mobile-auth-link");

  if (!token) {
    if (authLink) authLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    return;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      window.FISO.user = data.user;
      if (authLink) {
        authLink.setAttribute("title", `Collector: ${data.user.name}`);
        authLink.innerHTML = `<span style="font-size:0.75rem; color:var(--accent-yellow); font-weight:700;">${data.user.name.split(" ")[0]}</span>`;
      }
      if (mobileAuthLink) {
        mobileAuthLink.textContent = `Dashboard (${data.user.name})`;
      }
    } else {
      localStorage.removeItem("fiso_token");
    }
  } catch (err) {
    console.warn("Auth check failed:", err);
  }
}

// Toggle Favorite Shortlist
async function toggleFavoriteArtwork(productId, btnElement) {
  const token = localStorage.getItem("fiso_token");
  if (!token) {
    showToast("Please sign in to save artworks to your private Collector Shortlist.");
    setTimeout(() => { window.location.href = "/login.html"; }, 1200);
    return;
  }

  try {
    const res = await fetch(`/api/auth/favorites/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      if (btnElement) {
        btnElement.classList.toggle("favorited", data.isFavorited);
      }
      showToast(data.message);
    }
  } catch (err) {
    showToast("Error updating Collector Shortlist.");
  }
}

// Toast Notifications System
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global Exports
window.FISO.formatPrice = formatPrice;
window.FISO.addItemToCart = addItemToCart;
window.FISO.updateItemQuantity = updateItemQuantity;
window.FISO.removeItemFromCart = removeItemFromCart;
window.FISO.toggleFavoriteArtwork = toggleFavoriteArtwork;
window.FISO.showToast = showToast;