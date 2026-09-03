const User = require("../models/User");

// GET PROFILE
const db = require("../config/database");

// GET PROFILE
exports.getProfile = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT id, name, email, phone, role
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Get profile error:", err);

      return res.status(500).json({
        message: "Failed to fetch profile",
      });
    }

    if (!result || result.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result[0]);
  });
};

// UPDATE PROFILE
exports.updateProfile = (req, res) => {
  const { userId } = req.params;
  const { name, email, phone } = req.body;

  const sql = `
    UPDATE users
    SET name = ?, email = ?, phone = ?
    WHERE id = ?
  `;

  const db = require("../config/database");

  db.query(sql, [name, email, phone, userId], (err, result) => {
    if (err) {
      console.error("Update profile error:", err);

      return res.status(500).json({
        message: "Failed to update profile",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
    });
  });
};
