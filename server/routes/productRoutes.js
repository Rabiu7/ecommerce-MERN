const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", upload.single("image"), createProduct);

// EDIT PRODUCT
router.put("/:id", upload.single("image"), updateProduct);

// STOCK ONLY
router.put("/:id/stock", updateStock);

router.delete("/:id", deleteProduct);

module.exports = router;
