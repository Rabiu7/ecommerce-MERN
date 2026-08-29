const Cart = require("../models/Cart");

exports.getCart = (req, res) => {
  const userId = req.params.userId;

  Cart.getCart(userId, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

exports.addToCart = (req, res) => {
  const { user_id, product_id } = req.body;

  Cart.addToCart(user_id, product_id, (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      success: true,
      message: "Product added to cart 🛒",
    });
  });
};

exports.updateQuantity = (req, res) => {
  Cart.updateQuantity(req.params.id, req.body.quantity, (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Quantity updated",
    });
  });
};

exports.removeItem = (req, res) => {
  Cart.removeItem(req.params.id, (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Item removed",
    });
  });
};
