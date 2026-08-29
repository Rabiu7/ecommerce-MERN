const Product = require("../models/Product");

const cloudinary = require("../config/cloudinary");

// GET ALL PRODUCTS

exports.getProducts = (req, res) => {
  Product.getAll((err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

// GET SINGLE PRODUCT

exports.getProductById = (req, res) => {
  const id = req.params.id;

  Product.getById(
    id,

    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json(result[0]);
    },
  );
};

// CREATE PRODUCT

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category_id, price, discount, stock } = req.body;

    // 1. Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    // 2. Create product object
    const product = {
      name,
      description,
      category_id,
      price,
      discount: discount || 0,
      stock: stock || 0,
      image: result.secure_url,
    };

    // 3. Save product + Cloudinary URL to MySQL
    Product.create(product, (err, dbResult) => {
      if (err) {
        console.error("Database error:", err);

        return res.status(500).json({
          message: "Product creation failed",
          error: err,
        });
      }

      res.status(201).json({
        message: "Product created successfully",
        id: dbResult.insertId,
        image: result.secure_url,
      });
    });
  } catch (error) {
    console.error("Product creation error:", error);

    res.status(500).json({
      message: "Product creation failed",
      error: error.message,
    });
  }
};

// DELETE PRODUCT

exports.deleteProduct = (req, res) => {
  const id = req.params.id;

  Product.delete(
    id,

    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Product deleted successfully",
      });
    },
  );
};
