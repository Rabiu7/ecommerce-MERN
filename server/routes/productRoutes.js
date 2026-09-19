const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  getProducts,
  getProductsPaginated,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getRelatedProducts,
} = require("../controllers/productController");

// =========================================================
// PRODUCTS
// =========================================================

// Paginated products
router.get("/paginated", getProductsPaginated);

// Related products
router.get("/:id/related", getRelatedProducts);

// Existing all-products API
router.get("/", getProducts);

// Single product
router.get("/:id", getProductById);

// Create product
router.post("/", upload.single("image"), createProduct);

// Update complete product
router.put("/:id", upload.single("image"), updateProduct);

// Update stock only
router.put("/:id/stock", updateStock);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
