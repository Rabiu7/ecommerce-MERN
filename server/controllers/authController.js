const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

// REGISTER

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    User.findByEmail(email, async (err, result) => {
      if (result.length > 0) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,

        10,
      );

      User.create(
        {
          name,

          email,

          phone,

          password: hashedPassword,
        },

        (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            message: "User registered successfully",

            userId: result.insertId,
          });
        },
      );
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN

exports.login = (req, res) => {
  const {
    email,

    password,
  } = req.body;

  User.findByEmail(
    email,

    async (err, result) => {
      if (result.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const user = result[0];

      const match = await bcrypt.compare(
        password,

        user.password,
      );

      if (!match) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,

          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        },
      );

      res.json({
        message: "Login successful",

        token,

        user: {
          id: user.id,

          name: user.name,

          email: user.email,

          role: user.role,
        },
      });
    },
  );
};
