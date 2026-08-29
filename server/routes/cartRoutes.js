const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
} = require("../controllers/cartController");

router.get("/:userId", getCart);

router.post("/", addToCart);

router.put("/:id", updateQuantity);

router.delete("/:id", removeItem);

module.exports = router;
