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

router.get("/paginated", getProductsPaginated);

router.get("/:publicId/related", getRelatedProducts);

router.get("/", getProducts);

router.get("/:publicId", getProductById);

router.post("/", upload.single("image"), createProduct);

router.put("/:id", upload.single("image"), updateProduct);

router.put("/:id/stock", updateStock);

router.delete("/:id", deleteProduct);

module.exports = router;
