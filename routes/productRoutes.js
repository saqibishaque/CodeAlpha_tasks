const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getFilterOptions,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/meta/filters", getFilterOptions);
router.get("/:id", getProductById);

module.exports = router;
