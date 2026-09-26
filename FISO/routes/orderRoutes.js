const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getUserOrders,
} = require("../controllers/orderController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");

// Create order (supports both logged-in collectors and guests)
router.post("/", optionalAuth, createOrder);

// Get current user's past acquisitions
router.get("/user/my-orders", authenticate, getUserOrders);

// Get order details by orderNumber or ID
router.get("/:identifier", getOrderById);

module.exports = router;
