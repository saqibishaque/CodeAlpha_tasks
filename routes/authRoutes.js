const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  toggleFavorite,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticate, getProfile);
router.post("/favorites/:productId", authenticate, toggleFavorite);

module.exports = router;
