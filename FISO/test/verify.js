const http = require("http");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (data) {
      req.write(typeof data === "string" ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("✦ STARTING FISO GALLERY AUTOMATED TEST SUITE ✦");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Healthcheck
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/health",
      method: "GET",
    });
    assert(res.status === 200 && res.data.status === "online", "API Health check returns online");
  } catch (e) {
    assert(false, `API Health check failed: ${e.message}`);
  }

  // 2. Products API - All products
  let sampleArtworkId = 1;
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/products",
      method: "GET",
    });
    assert(res.status === 200 && res.data.success && res.data.count >= 6, `Products catalog returns ${res.data.count} artworks (>= 6 required)`);
    sampleArtworkId = res.data.products[0].id;
  } catch (e) {
    assert(false, `Products catalog fetch failed: ${e.message}`);
  }

  // 3. Products API - Filters (Category)
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/products?category=Modern%20Miniature",
      method: "GET",
    });
    assert(res.status === 200 && res.data.products.every(p => p.category === "Modern Miniature"), "Category filter returns only Modern Miniature artworks");
  } catch (e) {
    assert(false, `Category filter failed: ${e.message}`);
  }

  // 4. Products API - Single Artwork Details
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: `/api/products/${sampleArtworkId}`,
      method: "GET",
    });
    assert(res.status === 200 && res.data.product && res.data.product.criticalStatement, "Artwork details include title, criticalStatement, and related artworks");
  } catch (e) {
    assert(false, `Single artwork detail failed: ${e.message}`);
  }

  // 5. Auth API - User Registration
  let testToken = null;
  const testEmail = `test_collector_${Date.now()}@fiso.pk`;
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }, {
      name: "Zainab Niazi",
      email: testEmail,
      password: "securepassword123",
    });
    assert(res.status === 201 && res.data.success && res.data.token, "User registration creates new collector and returns JWT token");
    testToken = res.data.token;
  } catch (e) {
    assert(false, `User registration failed: ${e.message}`);
  }

  // 6. Auth API - User Login
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }, {
      email: "collector@fiso.pk",
      password: "collector123",
    });
    assert(res.status === 200 && res.data.success && res.data.user.name === "Amina Bilal", "Demo user login succeeds for Amina Bilal");
  } catch (e) {
    assert(false, `User login failed: ${e.message}`);
  }

  // 7. Auth API - Toggle Favorites
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: `/api/auth/favorites/${sampleArtworkId}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`,
      },
    });
    assert(res.status === 200 && res.data.success && typeof res.data.isFavorited === "boolean", "Shortlist/favorite toggles successfully for authenticated collector");
  } catch (e) {
    assert(false, `Favorite toggle failed: ${e.message}`);
  }

  // 8. Orders API - Create Order with Multi-step payload
  let createdOrderNumber = "";
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/orders",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`,
      },
    }, {
      customerName: "Zainab Niazi",
      customerEmail: testEmail,
      customerPhone: "+92 321 9876543",
      shippingAddress: {
        street: "Bungalow 18, 5th Avenue, DHA Phase 5",
        city: "Lahore",
        province: "Punjab",
        postalCode: "54000",
        country: "Pakistan",
      },
      courier: "TCS Art Express (Insured Fine Art Logistics)",
      paymentMethod: "Credit / Debit Card (Simulated 3D Secure)",
      items: [
        { productId: sampleArtworkId, quantity: 1 }
      ]
    });
    assert(res.status === 201 && res.data.success && res.data.order.orderNumber.startsWith("FISO-"), "Order creation succeeds with generated FISO order number and tracking code");
    createdOrderNumber = res.data.order.orderNumber;
  } catch (e) {
    assert(false, `Order creation failed: ${e.message}`);
  }

  // 9. Orders API - Retrieve Order by orderNumber
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: `/api/orders/${createdOrderNumber}`,
      method: "GET",
    });
    assert(res.status === 200 && res.data.success && res.data.order.orderNumber === createdOrderNumber, "Order retrieval by orderNumber returns order details");
  } catch (e) {
    assert(false, `Order retrieval failed: ${e.message}`);
  }

  // 10. Community API - Submit Interpretation
  try {
    const res = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/community/interpretations",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }, {
      artworkId: sampleArtworkId,
      promptTitle: "The Decolonial Gaze in Miniatures",
      authorName: "Usman Ghani",
      city: "Peshawar",
      interpretationText: "The juxtaposition of electric wires and miniature gold leaf forces the viewer to confront the layered contradictions of modern Pakistani heritage.",
    });
    assert(res.status === 201 && res.data.success && res.data.interpretation.id, "Think & Create interpretation submitted successfully to the curatorial wall");
  } catch (e) {
    assert(false, `Community submission failed: ${e.message}`);
  }

  console.log("==================================================");
  console.log(`✦ RESULTS: ${passed} PASSED | ${failed} FAILED ✦`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();