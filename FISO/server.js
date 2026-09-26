const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sequelize, Product } = require("./models");

// Route handlers
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const communityRoutes = require("./routes/communityRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Core Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, "public")));

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/community", communityRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    gallery: "FISO Pakistani Contemporary Art",
    timestamp: new Date().toISOString(),
  });
});

// HTML Page Route Helpers (allows clean URLs or direct file access)
app.get("/catalog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "catalog.html"));
});

app.get("/artwork/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "product.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cart.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Error handling middleware
app.use(errorHandler);

// Database initialization and server boot
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✦ Database connection established successfully.");

    // Sync schema without dropping
    await sequelize.sync();

    // Check if products exist, otherwise auto-seed
    const count = await Product.count();
    if (count === 0) {
      console.log("✦ No artworks found. Auto-running initial seed script...");
      require("./seed");
    }

    app.listen(PORT, () => {
      console.log(`✦ FISO Gallery Server running at http://localhost:${PORT}`);
      console.log(`✦ Frontend accessible at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Failed to start FISO Gallery server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
