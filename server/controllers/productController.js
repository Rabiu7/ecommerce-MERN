const Product = require("../models/Product");

const db = require("../config/database");
const transporter = require("../config/email");

const cloudinary = require("../config/cloudinary");

// =========================================================
// GET ALL PRODUCTS
// =========================================================

exports.getProducts = (req, res) => {
  Product.getAll((err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
};

// =========================================================
// GET SINGLE PRODUCT
// =========================================================

exports.getProductById = (req, res) => {
  const id = req.params.id;

  Product.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result[0]);
  });
};

// =========================================================
// CREATE PRODUCT
// =========================================================

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category_id, price, discount, stock } = req.body;

    if (!name || !category_id || !price) {
      return res.status(400).json({
        message: "Name, category and price are required.",
      });
    }

    // =====================================================
    // UPLOAD IMAGE TO CLOUDINARY
    // =====================================================

    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });

      imageUrl = result.secure_url;
    }

    // =====================================================
    // CREATE PRODUCT OBJECT
    // =====================================================

    const product = {
      name,
      description,
      category_id,
      price,
      discount: discount || 0,
      stock: stock || 0,
      image: imageUrl,
    };

    // =====================================================
    // SAVE TO MYSQL
    // =====================================================

    Product.create(product, (err, dbResult) => {
      if (err) {
        console.error("Database error:", err);

        return res.status(500).json({
          message: "Product creation failed",
          error: err.message,
        });
      }

      res.status(201).json({
        message: "Product created successfully",
        id: dbResult.insertId,
        image: imageUrl,
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

// =========================================================
// UPDATE PRODUCT
// =========================================================

exports.updateProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const { name, description, category_id, price, discount, stock } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required.",
      });
    }

    if (!category_id) {
      return res.status(400).json({
        message: "Category is required.",
      });
    }

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0.",
      });
    }

    const newStock = Number(stock);

    if (!Number.isInteger(newStock) || newStock < 0) {
      return res.status(400).json({
        message: "Stock must be a valid number greater than or equal to 0.",
      });
    }

    const numericDiscount = Number(discount || 0);

    if (numericDiscount < 0 || numericDiscount > 100) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100.",
      });
    }

    // =====================================================
    // GET EXISTING PRODUCT
    // =====================================================

    const getProductSql = `
      SELECT
        id,
        name,
        stock,
        image
      FROM products
      WHERE id = ?
      LIMIT 1
    `;

    db.query(getProductSql, [productId], async (getError, products) => {
      if (getError) {
        console.error("Get product for update error:", getError);

        return res.status(500).json({
          message: "Unable to get product.",
        });
      }

      if (products.length === 0) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      const oldStock = Number(products[0].stock);
      const oldImage = products[0].image;

      // =====================================================
      // IMAGE
      // =====================================================

      let imageUrl = oldImage;

      if (req.file) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "products",
        });

        imageUrl = uploadResult.secure_url;
      }

      // =====================================================
      // UPDATE PRODUCT
      // =====================================================

      const product = {
        name: name.trim(),
        description: description?.trim() || "",
        category_id,
        price: Number(price),
        discount: numericDiscount,
        stock: newStock,
        image: imageUrl,
      };

      Product.update(productId, product, (updateError) => {
        if (updateError) {
          console.error("Product update error:", updateError);

          return res.status(500).json({
            message: "Failed to update product.",
            error: updateError.message,
          });
        }

        // ===================================================
        // PRODUCT RESTOCKED
        // ===================================================

        if (oldStock <= 0 && newStock > 0) {
          sendStockReminderEmails(productId, product.name);
        }

        return res.status(200).json({
          success: true,
          message: "Product updated successfully.",
          product: {
            id: Number(productId),
            ...product,
          },
        });
      });
    });
  } catch (error) {
    console.error("Product update error:", error);

    return res.status(500).json({
      message: "Failed to update product.",
      error: error.message,
    });
  }
};

// =========================================================
// GET PAGINATED PRODUCTS
// =========================================================

exports.getProductsPaginated = (req, res) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 12;

  const search = (req.query.search || "").trim();
  const category = (req.query.category || "All").trim();
  const sort = req.query.sort || "featured";

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 12;
  }

  if (limit > 50) {
    limit = 50;
  }

  const allowedSorts = ["featured", "low", "high", "rating"];

  const safeSort = allowedSorts.includes(sort) ? sort : "featured";

  const offset = (page - 1) * limit;

  Product.getPaginatedCount(search, category, (countError, countResult) => {
    if (countError) {
      console.error("Product count error:", countError);

      return res.status(500).json({
        message: "Unable to get product count.",
      });
    }

    const totalProducts = Number(countResult[0].total);

    const totalPages =
      totalProducts === 0 ? 0 : Math.ceil(totalProducts / limit);

    if (totalPages > 0 && page > totalPages) {
      return res.status(404).json({
        message: "Page not found.",
      });
    }

    Product.getPaginated(
      limit,
      offset,
      search,
      category,
      safeSort,
      (productsError, products) => {
        if (productsError) {
          console.error("Get paginated products error:", productsError);

          return res.status(500).json({
            message: "Unable to load products.",
          });
        }

        res.json({
          products,
          pagination: {
            currentPage: page,
            limit,
            totalProducts,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      },
    );
  });
};

exports.getRelatedProducts = (req, res) => {
  const productId = req.params.id;

  let limit = Number(req.query.limit) || 4;

  if (limit < 1) {
    limit = 4;
  }

  if (limit > 10) {
    limit = 10;
  }

  Product.getRelated(productId, limit, (err, result) => {
    if (err) {
      console.error("Get related products error:", err);

      return res.status(500).json({
        message: "Unable to load related products",
      });
    }

    res.json(result);
  });
};

// =========================================================
// DELETE PRODUCT
// =========================================================

exports.deleteProduct = (req, res) => {
  const id = req.params.id;

  Product.delete(id, (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      message: "Product deleted successfully",
    });
  });
};

exports.getRelatedProducts = (req, res) => {
  const productId = req.params.id;

  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 4;

  // Validate page
  if (page < 1) {
    page = 1;
  }

  // Validate limit
  if (limit < 1) {
    limit = 4;
  }

  // Prevent very large requests
  if (limit > 10) {
    limit = 10;
  }

  const offset = (page - 1) * limit;

  // =========================================================
  // GET TOTAL RELATED PRODUCTS
  // =========================================================

  Product.getRelatedCount(productId, (countError, countResult) => {
    if (countError) {
      console.error("Get related product count error:", countError);

      return res.status(500).json({
        message: "Unable to get related product count.",
      });
    }

    const totalProducts = Number(countResult[0].total);

    const totalPages =
      totalProducts === 0 ? 0 : Math.ceil(totalProducts / limit);

    // =========================================================
    // INVALID PAGE
    // =========================================================

    if (totalPages > 0 && page > totalPages) {
      return res.status(404).json({
        message: "Page not found.",
      });
    }

    // =========================================================
    // GET RELATED PRODUCTS FOR CURRENT PAGE
    // =========================================================

    Product.getRelatedPaginated(
      productId,
      limit,
      offset,
      (productsError, products) => {
        if (productsError) {
          console.error("Get related products error:", productsError);

          return res.status(500).json({
            message: "Unable to load related products.",
          });
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        res.json({
          products,

          pagination: {
            currentPage: page,
            limit,
            totalProducts,
            totalPages,

            hasNextPage: page < totalPages,

            hasPreviousPage: page > 1,
          },
        });
      },
    );
  });
};

// =========================================================
// UPDATE PRODUCT STOCK
// =========================================================

exports.updateStock = (req, res) => {
  const productId = req.params.id;
  const newStock = Number(req.body.stock);

  if (!Number.isInteger(newStock) || newStock < 0) {
    return res.status(400).json({
      message: "Stock must be a valid number greater than or equal to 0.",
    });
  }

  const getProductSql = `
    SELECT
      id,
      name,
      stock
    FROM products
    WHERE id = ?
    LIMIT 1
  `;

  db.query(getProductSql, [productId], (getError, products) => {
    if (getError) {
      console.error("Get product stock error:", getError);

      return res.status(500).json({
        message: "Unable to get product stock.",
      });
    }

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    console.log("Stock update:", {
      productId,
      oldStock,
      newStock,
    });

    const oldStock = Number(products[0].stock);
    const productName = products[0].name;

    Product.updateStock(productId, newStock, (updateError) => {
      if (updateError) {
        console.error("Stock update error:", updateError);

        return res.status(500).json({
          message: "Unable to update product stock.",
        });
      }

      if (oldStock <= 0 && newStock > 0) {
        sendStockReminderEmails(productId, productName);
      }

      res.json({
        message: "Product stock updated successfully.",
        oldStock,
        newStock,
      });
    });
  });
};

// =========================================================
// SEND STOCK REMINDER EMAILS
// =========================================================

const sendStockReminderEmails = (productId, productName) => {
  const sql = `
    SELECT
      sr.id AS reminder_id,
      u.name,
      u.email
    FROM stock_reminders sr
    INNER JOIN users u
      ON u.id = sr.user_id
    WHERE sr.product_id = ?
      AND sr.notified = 0
  `;

  db.query(sql, [productId], async (err, reminders) => {
    if (err) {
      console.error("Get stock reminders error:", err);
      return;
    }

    if (reminders.length === 0) {
      console.log("No pending stock reminders.");
      return;
    }

    for (const reminder of reminders) {
      console.log("Sending stock reminder to:", reminder.email);

      try {
        await transporter.sendMail({
          from: `"Masha Allah Creations" <${process.env.EMAIL_USER}>`,
          to: reminder.email,
          subject: `${productName} is back in stock!`,
          html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #333;
            ">

              <h2 style="margin-bottom: 20px;">
                Good news, ${reminder.name}! 🎉
              </h2>

              <p>
                The product you were waiting for is now
                <strong>back in stock</strong>.
              </p>

              <h3>
                ${productName}
              </h3>

              <p>
                You can now visit Masha Allah Creations
                and place your order.
              </p>

              <p style="margin-top: 30px;">
                Thank you for choosing
                <strong>Masha Allah Creations</strong>.
              </p>

            </div>
          `,
        });

        console.log("Stock reminder sent to:", reminder.email);

        const updateReminderSql = `
          UPDATE stock_reminders
          SET
            notified = 1,
            notified_at = NOW()
          WHERE id = ?
        `;

        db.query(updateReminderSql, [reminder.reminder_id], (updateError) => {
          if (updateError) {
            console.error("Update reminder notification error:", updateError);
          }
        });

        console.log(`Stock reminder email sent to ${reminder.email}`);
      } catch (emailError) {
        console.error(
          `Failed to send stock reminder to ${reminder.email}:`,
          emailError,
        );
      }
    }
  });
};
