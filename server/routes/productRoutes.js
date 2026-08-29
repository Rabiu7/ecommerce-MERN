const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  getProducts,

  getProductById,

  createProduct,

  deleteProduct,
} = require("../controllers/productController");

// GET ALL

router.get(
  "/",

  getProducts,
);

// GET SINGLE

router.get(
  "/:id",

  getProductById,
);

// CREATE

router.post("/", upload.single("image"), createProduct);

// DELETE

router.delete(
  "/:id",

  deleteProduct,
);

module.exports = router;
