const db = require("../config/database");

// ==========================================
// GET SAVED ADDRESS
// ==========================================

exports.getAddress = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      id,
      user_id,
      full_name,
      phone,
      address,
      city,
      state,
      pincode
    FROM addresses
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Get address error:", err);

      return res.status(500).json({
        message: "Failed to fetch address",
      });
    }

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "No saved address found",
      });
    }

    res.json(result[0]);
  });
};

// ==========================================
// SAVE / UPDATE ADDRESS
// ==========================================

exports.saveAddress = (req, res) => {
  const { userId } = req.params;

  const { fullName, phone, address, city, state, pincode } = req.body;

  if (!fullName || !phone || !address || !city || !state || !pincode) {
    return res.status(400).json({
      message: "All address fields are required",
    });
  }

  const checkSql = `
    SELECT id
    FROM addresses
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(checkSql, [userId], (err, result) => {
    if (err) {
      console.error("Check address error:", err);

      return res.status(500).json({
        message: "Failed to check address",
      });
    }

    // ==========================================
    // UPDATE EXISTING ADDRESS
    // ==========================================

    if (result.length > 0) {
      const addressId = result[0].id;

      const updateSql = `
        UPDATE addresses
        SET
          full_name = ?,
          phone = ?,
          address = ?,
          city = ?,
          state = ?,
          pincode = ?
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [fullName, phone, address, city, state, pincode, addressId],
        (err) => {
          if (err) {
            console.error("Update address error:", err);

            return res.status(500).json({
              message: "Failed to update address",
            });
          }

          res.json({
            message: "Address updated successfully",
          });
        },
      );

      return;
    }

    // ==========================================
    // INSERT NEW ADDRESS
    // ==========================================

    const insertSql = `
      INSERT INTO addresses
      (
        user_id,
        full_name,
        phone,
        address,
        city,
        state,
        pincode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [userId, fullName, phone, address, city, state, pincode],
      (err) => {
        if (err) {
          console.error("Save address error:", err);

          return res.status(500).json({
            message: "Failed to save address",
          });
        }

        res.status(201).json({
          message: "Address saved successfully",
        });
      },
    );
  });
};
