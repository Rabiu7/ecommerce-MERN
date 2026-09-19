const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  getProducts,
  getProductsPaginated,
  getProductById,
  createProduct,
  deleteProduct,
  updateStock,
  getRelatedProducts,
} = require("../controllers/productController");

// =========================================================
// PRODUCTS
// =========================================================

// Paginated products
router.get("/paginated", getProductsPaginated);

router.get("/:id/related", getRelatedProducts);

// Existing all-products API
router.get("/", getProducts);

// Single product
router.get("/:id", getProductById);

// Create product
router.post("/", upload.single("image"), createProduct);

// Update stock
router.put("/:id/stock", updateStock);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
