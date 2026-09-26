/* ==========================================================================
   FISO GALLERY - Authentication & Collector Dashboard Controller (auth.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initAuthTabs();
  setupLoginForm();
  setupRegisterForm();
  loadCollectorDashboard();
});

function initAuthTabs() {
  const tabs = document.querySelectorAll(".auth-tab");
  const loginForm = document.getElementById("login-form-container");
  const registerForm = document.getElementById("register-form-container");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-target");
      if (target === "login") {
        if (loginForm) loginForm.style.display = "block";
        if (registerForm) registerForm.style.display = "none";
      } else {
        if (loginForm) loginForm.style.display = "none";
        if (registerForm) registerForm.style.display = "block";
      }
    });
  });
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Authenticating...";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("fiso_token", data.token);
        window.FISO.showToast(data.message);
        loadCollectorDashboard();
      } else {
        window.FISO.showToast(data.message || "Invalid login credentials.");
        btn.disabled = false;
        btn.textContent = "Sign In as Collector";
      }
    } catch (err) {
      window.FISO.showToast("Connection error. Please try again.");
      btn.disabled = false;
      btn.textContent = "Sign In as Collector";
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Creating Account...";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem("fiso_token", data.token);
        window.FISO.showToast("Collector profile registered. Welcome to FISO.");
        loadCollectorDashboard();
      } else {
        window.FISO.showToast(data.message || "Registration failed.");
        btn.disabled = false;
        btn.textContent = "Open Collector Account";
      }
    } catch (err) {
      window.FISO.showToast("Connection error. Please try again.");
      btn.disabled = false;
      btn.textContent = "Open Collector Account";
    }
  });
}

async function loadCollectorDashboard() {
  const token = localStorage.getItem("fiso_token");
  const authPortal = document.getElementById("auth-portal-section");
  const dashboard = document.getElementById("collector-dashboard-section");

  if (!token) {
    if (authPortal) authPortal.style.display = "block";
    if (dashboard) dashboard.style.display = "none";
    return;
  }

  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success && data.user) {
      if (authPortal) authPortal.style.display = "none";
      if (dashboard) dashboard.style.display = "block";

      renderDashboardUser(data.user);
      renderDashboardOrders(data.orders);
      renderDashboardFavorites(data.favoriteProducts);
    } else {
      localStorage.removeItem("fiso_token");
      if (authPortal) authPortal.style.display = "block";
      if (dashboard) dashboard.style.display = "none";
    }
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

function renderDashboardUser(user) {
  const nameEl = document.getElementById("dash-user-name");
  const emailEl = document.getElementById("dash-user-email");
  const roleEl = document.getElementById("dash-user-role");

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (roleEl) roleEl.textContent = user.role === "curator" ? "FISO Curatorial Board" : "Patron & Collector";

  const logoutBtn = document.getElementById("dash-logout-btn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("fiso_token");
      window.FISO.showToast("Signed out successfully.");
      window.location.reload();
    };
  }
}

function renderDashboardOrders(orders) {
  const container = document.getElementById("dash-orders-container");
  if (!container) return;

  if (!orders || !orders.length) {
    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 3rem; text-align: center;">
        <p style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem;">No acquisitions on record.</p>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Pieces you acquire will appear here with white-glove tracking details.</p>
        <a href="/catalog.html" class="btn btn-outline btn-sm">Explore Pakistani Art Catalog</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(ord => {
    let statusClass = "status-confirmed";
    if (ord.status === "In Transit") statusClass = "status-transit";
    if (ord.status === "Delivered") statusClass = "status-delivered";

    const itemsHtml = (ord.items || []).map(i => `
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
        <div style="width: 48px; height: 48px; background: #000; overflow: hidden; border: 1px solid var(--border-color);">
          <img src="${i.imageUrl}" alt="${i.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">${i.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${i.artist} &bull; Qty: ${i.quantity}</div>
        </div>
      </div>
    `).join("");

    return `
      <div class="order-history-card">
        <div class="order-history-header">
          <div>
            <span style="font-family: monospace; color: var(--accent-yellow); font-size: 1.05rem; font-weight: 700;">${ord.orderNumber}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.75rem;">${new Date(ord.createdAt).toLocaleDateString("en-PK", { dateStyle: "long" })}</span>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <span class="order-status-tag ${statusClass}">${ord.status}</span>
            <span style="font-weight: 700; color: #FFF;">Rs. ${ord.totalPkr.toLocaleString()}</span>
          </div>
        </div>
        <div style="margin-bottom: 1rem;">
          ${itemsHtml}
        </div>
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; font-size: 0.8rem; color: var(--text-muted); display: flex; flex-wrap: wrap; justify-content: space-between;">
          <span>Courier: ${ord.courier}</span>
          <span>Tracking: <strong style="color: #FFF;">${ord.trackingCode || 'Pending Assignment'}</strong></span>
        </div>
      </div>
    `;
  }).join("");
}

function renderDashboardFavorites(favorites) {
  const container = document.getElementById("dash-favorites-container");
  if (!container) return;

  if (!favorites || !favorites.length) {
    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 2rem; text-align: center;">
        <p style="color: var(--text-muted); font-size: 0.9rem;">Your private Collector Shortlist is empty. Click the heart icon on any artwork to save it.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;">
      ${favorites.map(art => `
        <div class="art-card">
          <div class="art-thumb-wrap">
            <a href="/product.html?id=${art.id}">
              <img src="${art.imageUrl}" alt="${art.title}" />
            </a>
          </div>
          <div class="art-info">
            <span class="art-category">${art.category}</span>
            <a href="/product.html?id=${art.id}"><h4 class="art-title" style="font-size: 1.15rem;">${art.title}</h4></a>
            <p class="art-artist">${art.artist}</p>
            <div class="art-footer">
              <span class="art-price-val" style="font-size: 1.1rem;">${window.FISO.formatPrice(art.pricePkr, art.priceUsd)}</span>
              <a href="/product.html?id=${art.id}" class="btn btn-outline btn-sm">Inspect</a>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}