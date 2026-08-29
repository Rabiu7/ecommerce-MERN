const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.post("/", upload.single("image"), createCategory);

router.put("/:id", upload.single("image"), updateCategory);

router.delete("/:id", deleteCategory);

module.exports = router;
