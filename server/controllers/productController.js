const Product = require("../models/Product");

const db = require("../config/database");
const transporter = require("../config/email");

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
    }
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
    }
  );
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

  // First get current product stock
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

    const oldStock = Number(products[0].stock);
    const productName = products[0].name;

    Product.updateStock(productId, newStock, (updateError) => {
      if (updateError) {
        console.error("Stock update error:", updateError);

        return res.status(500).json({
          message: "Unable to update product stock.",
        });
      }

      // =====================================================
      // PRODUCT RESTOCKED
      // =====================================================

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

        // Mark reminder as notified
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
          emailError
        );
      }
    }
  });
};
