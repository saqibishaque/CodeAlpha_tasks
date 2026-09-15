/* ==========================================================================
   FISO GALLERY - Full Cart & Multi-Step Checkout Controller (cart.js)
   ========================================================================== */

let currentCheckoutStep = 1;

document.addEventListener("DOMContentLoaded", () => {
  renderFullCartPage();
  initCheckoutStepper();
  setupCourierListeners();
  setupOrderForm();

  document.addEventListener("currencyChange", () => {
    renderFullCartPage();
    updateCheckoutSummary();
  });
});

// Render the main cart page items
function renderFullCartPage() {
  const container = document.getElementById("full-cart-items");
  const emptyState = document.getElementById("cart-empty-state");
  const contentState = document.getElementById("cart-content-state");

  const cart = window.FISO.cart && window.FISO.cart.length ? window.FISO.cart : JSON.parse(localStorage.getItem("fiso_cart") || "[]");

  if (!cart.length) {
    if (emptyState) emptyState.style.display = "block";
    if (contentState) contentState.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (contentState) contentState.style.display = "grid";

  if (container) {
    container.innerHTML = cart.map(item => {
      return `
        <div class="checkout-card" style="margin-bottom: 1.25rem; display: flex; gap: 1.5rem; align-items: center;" data-id="${item.id}">
          <div style="width: 90px; height: 90px; background: #000; flex-shrink: 0; overflow: hidden; border: 1px solid var(--border-color);">
            <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="flex-grow: 1;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 1.25rem; margin-bottom: 0.2rem;">${item.title}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${item.artist} &bull; ${item.medium || 'Contemporary Medium'}</p>
              </div>
              <button onclick="removeItemFromCart(${item.id}); renderFullCartPage();" style="background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 0.85rem;">Remove</button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
              <div class="drawer-qty-controls">
                <button class="qty-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity - 1}); renderFullCartPage();">-</button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn" onclick="updateItemQuantity(${item.id}, ${item.quantity + 1}); renderFullCartPage();">+</button>
              </div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--accent-yellow);">
                ${window.FISO.formatPrice(item.pricePkr * item.quantity, item.priceUsd * item.quantity)}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  updateCheckoutSummary();
}

// Calculate and update order summary box
function updateCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem("fiso_cart") || "[]");
  const subtotalPkr = cart.reduce((sum, i) => sum + (i.pricePkr * i.quantity), 0);
  const subtotalUsd = cart.reduce((sum, i) => sum + ((i.priceUsd || Math.round(i.pricePkr / 280)) * i.quantity), 0);

  // Selected courier price
  const selectedCourierRadio = document.querySelector('input[name="courierOption"]:checked');
  const courierPkr = selectedCourierRadio ? parseInt(selectedCourierRadio.dataset.feePkr || "0", 10) : (subtotalPkr >= 100000 ? 0 : 2500);
  const courierUsd = Math.round(courierPkr / 280);

  const totalPkr = subtotalPkr + courierPkr;
  const totalUsd = subtotalUsd + courierUsd;

  const subtotalEl = document.getElementById("summary-subtotal");
  const shippingEl = document.getElementById("summary-shipping");
  const totalEl = document.getElementById("summary-total");

  if (subtotalEl) subtotalEl.textContent = window.FISO.formatPrice(subtotalPkr, subtotalUsd);
  if (shippingEl) shippingEl.textContent = courierPkr === 0 ? "Complimentary White-Glove" : window.FISO.formatPrice(courierPkr, courierUsd);
  if (totalEl) totalEl.textContent = window.FISO.formatPrice(totalPkr, totalUsd);
}

// Stepper Navigation
function initCheckoutStepper() {
  const proceedBtn = document.getElementById("proceed-to-shipping-btn");
  const backToCartBtn = document.getElementById("back-to-cart-btn");
  const proceedToPaymentBtn = document.getElementById("proceed-to-payment-btn");
  const backToShippingBtn = document.getElementById("back-to-shipping-btn");

  if (proceedBtn) {
    proceedBtn.addEventListener("click", () => setStep(2));
  }
  if (backToCartBtn) {
    backToCartBtn.addEventListener("click", () => setStep(1));
  }
  if (proceedToPaymentBtn) {
    proceedToPaymentBtn.addEventListener("click", () => {
      // Validate Step 2 inputs
      const name = document.getElementById("ship-name").value.trim();
      const email = document.getElementById("ship-email").value.trim();
      const phone = document.getElementById("ship-phone").value.trim();
      const address = document.getElementById("ship-address").value.trim();
      const city = document.getElementById("ship-city").value.trim();

      if (!name || !email || !phone || !address || !city) {
        window.FISO.showToast("Please fill in all delivery details before continuing.");
        return;
      }
      setStep(3);
    });
  }
  if (backToShippingBtn) {
    backToShippingBtn.addEventListener("click", () => setStep(2));
  }
}

function setStep(step) {
  currentCheckoutStep = step;

  const step1Sec = document.getElementById("step-1-cart");
  const step2Sec = document.getElementById("step-2-shipping");
  const step3Sec = document.getElementById("step-3-payment");
  const step4Sec = document.getElementById("step-4-confirmation");

  if (step1Sec) step1Sec.style.display = step === 1 ? "block" : "none";
  if (step2Sec) step2Sec.style.display = step === 2 ? "block" : "none";
  if (step3Sec) step3Sec.style.display = step === 3 ? "block" : "none";
  if (step4Sec) step4Sec.style.display = step === 4 ? "block" : "none";

  // Hide summary box on confirmation
  const summaryCol = document.getElementById("checkout-summary-col");
  if (summaryCol) {
    summaryCol.style.display = step === 4 ? "none" : "block";
  }

  // Update Stepper Indicators
  document.querySelectorAll(".step-indicator").forEach((ind, index) => {
    const stepNum = index + 1;
    ind.classList.toggle("active", stepNum === step);
    ind.classList.toggle("completed", stepNum < step);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Courier listeners
function setupCourierListeners() {
  const options = document.querySelectorAll('.courier-option');
  options.forEach(opt => {
    opt.addEventListener("click", () => {
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      options.forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      updateCheckoutSummary();
    });
  });
}

// Setup order placement submission
function setupOrderForm() {
  const placeOrderBtn = document.getElementById("place-order-btn");
  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem("fiso_cart") || "[]");
    if (!cart.length) {
      window.FISO.showToast("Your cart is empty.");
      return;
    }

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Securing Artwork & Processing Acquisition...";

    const name = document.getElementById("ship-name").value.trim();
    const email = document.getElementById("ship-email").value.trim();
    const phone = document.getElementById("ship-phone").value.trim();
    const address = document.getElementById("ship-address").value.trim();
    const city = document.getElementById("ship-city").value.trim();
    const province = document.getElementById("ship-province").value;
    const postalCode = document.getElementById("ship-postal").value.trim();

    const courierRadio = document.querySelector('input[name="courierOption"]:checked');
    const courier = courierRadio ? courierRadio.value : "TCS Art Express (Insured Fine Art Logistics)";

    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : "Credit / Debit Card (Simulated 3D Secure)";

    const token = localStorage.getItem("fiso_token");

    const payload = {
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        street: address,
        city: city,
        province: province,
        postalCode: postalCode,
        country: "Pakistan",
      },
      courier,
      paymentMethod,
      items: cart.map(i => ({
        productId: i.id,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.order) {
        // Clear cart
        localStorage.removeItem("fiso_cart");
        window.FISO.cart = [];
        window.FISO.renderHeaderCartBadge && window.FISO.renderHeaderCartBadge();

        // Render Confirmation Screen
        renderConfirmationScreen(data.order);
        setStep(4);
      } else {
        window.FISO.showToast(data.message || "Failed to complete acquisition.");
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Confirm Art Acquisition";
      }
    } catch (err) {
      console.error(err);
      window.FISO.showToast("Network error. Please try again.");
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Confirm Art Acquisition";
    }
  });
}

function renderConfirmationScreen(order) {
  const refEl = document.getElementById("conf-order-num");
  const trackEl = document.getElementById("conf-tracking-code");
  const nameEl = document.getElementById("conf-name");
  const courierEl = document.getElementById("conf-courier");
  const totalEl = document.getElementById("conf-total");

  if (refEl) refEl.textContent = order.orderNumber;
  if (trackEl) trackEl.textContent = order.trackingCode;
  if (nameEl) nameEl.textContent = order.customerName;
  if (courierEl) courierEl.textContent = order.courier;
  if (totalEl) totalEl.textContent = `Rs. ${order.totalPkr.toLocaleString()}`;
}