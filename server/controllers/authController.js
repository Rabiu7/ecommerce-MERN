const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const User = require("../models/User");

const crypto = require("crypto");

const db = require("../config/database");
const transporter = require("../config/email");

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.promise().query(
      `
      SELECT id, name, email
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [normalizedEmail],
    );

    /*
     * Always return the same message.
     * This prevents revealing whether an email
     * exists in the database.
     */
    if (users.length === 0) {
      return res.json({
        success: true,
        message:
          "If an account exists with this email address, a password reset link will be sent.",
      });
    }

    const user = users[0];

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token valid for 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Remove previous unused tokens for this user
    await db.promise().query(
      `
      DELETE FROM password_reset_tokens
      WHERE user_id = ?
      AND used = 0
      `,
      [user.id],
    );

    // Save new token
    await db.promise().query(
      `
      INSERT INTO password_reset_tokens
      (
        user_id,
        token_hash,
        expires_at,
        used
      )
      VALUES (?, ?, ?, 0)
      `,
      [user.id, tokenHash, expiresAt],
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Masha Allah Creations" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your Masha Allah Creations password",
      html: `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background: #faf9f7;
          font-family: Arial, sans-serif;
        ">
          <div style="
            max-width: 520px;
            margin: 0 auto;
            padding: 35px;
            background: #ffffff;
            border: 1px solid #ebe7e0;
            border-radius: 12px;
          ">

            <div style="
              text-align: center;
              margin-bottom: 30px;
            ">
              <img
                src="https://res.cloudinary.com/gvp9r7mv/image/upload/v1789926478/logo_mqh1bp.png"
                alt="Masha Allah Creations"
                style="
                  width: 140px;
                  max-width: 100%;
                  height: auto;
                  display: inline-block;
                "
              />
            </div>

            <h2 style="
              margin: 0 0 15px;
              color: #252525;
              text-align: center;
            ">
              Reset Your Password
            </h2>

            <p style="
              color: #666666;
              line-height: 1.7;
            ">
              Hello ${user.name || "there"},
            </p>

            <p style="
              color: #666666;
              line-height: 1.7;
            ">
              We received a request to reset the password for your
              Masha Allah Creations account.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 13px 25px;
                  background: #a27b3f;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 7px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>
            </div>

            <p style="
              color: #777777;
              font-size: 13px;
              line-height: 1.6;
            ">
              This link will expire in 30 minutes.
            </p>

            <p style="
              color: #777777;
              font-size: 13px;
              line-height: 1.6;
            ">
              If you did not request a password reset, you can safely
              ignore this email.
            </p>

            <hr style="
              margin: 30px 0;
              border: none;
              border-top: 1px solid #eeeeee;
            ">

            <p style="
              margin: 0;
              text-align: center;
              color: #999999;
              font-size: 11px;
            ">
              © Masha Allah Creations
            </p>

          </div>
        </div>
      `,
    });

    return res.json({
      success: true,
      message:
        "If an account exists with this email address, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("=================================");
    console.error("FORGOT PASSWORD ERROR");
    console.error("=================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Hash token received from URL
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [rows] = await db.promise().query(
      `
      SELECT
        id,
        user_id,
        expires_at,
        used
      FROM password_reset_tokens
      WHERE token_hash = ?
      LIMIT 1
      `,
      [tokenHash],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link.",
      });
    }

    const resetToken = rows[0];

    if (resetToken.used) {
      return res.status(400).json({
        success: false,
        message: "This reset link has already been used.",
      });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This reset link has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, resetToken.user_id],
    );

    // Mark token as used
    await db.promise().query(
      `
      UPDATE password_reset_tokens
      SET used = 1
      WHERE id = ?
      `,
      [resetToken.id],
    );

    return res.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password.",
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

// GOOGLE LOGIN

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    // ---------------------------------------------------------
    // VERIFY GOOGLE TOKEN
    // ---------------------------------------------------------

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google credential.",
      });
    }

    const googleEmail = payload.email;
    const googleName = payload.name || "Google User";

    // Only allow verified Google email addresses
    if (!payload.email_verified) {
      return res.status(401).json({
        message: "Google email address is not verified.",
      });
    }

    // ---------------------------------------------------------
    // FIND EXISTING USER
    // ---------------------------------------------------------

    User.findByEmail(
      googleEmail,
      async (err, result) => {
        if (err) {
          console.error("Google login database error:", err);

          return res.status(500).json({
            message: "Unable to sign in with Google.",
          });
        }

        // -----------------------------------------------------
        // EXISTING USER
        // -----------------------------------------------------

        if (result.length > 0) {
          const user = result[0];

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

          return res.json({
            message: "Google login successful",

            token,

            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }

        // -----------------------------------------------------
        // NEW USER
        // -----------------------------------------------------

        // Generate an internal password because
        // users.password is NOT NULL.
        const randomPassword = crypto.randomBytes(32).toString("hex");

        const hashedPassword = await bcrypt.hash(
          randomPassword,
          10,
        );

        User.create(
          {
            name: googleName,
            email: googleEmail,
            phone: null,
            password: hashedPassword,
          },
          (createErr, createResult) => {
            if (createErr) {
              console.error(
                "Google user creation error:",
                createErr,
              );

              return res.status(500).json({
                message: "Unable to create Google account.",
              });
            }

            const userId = createResult.insertId;

            const token = jwt.sign(
              {
                id: userId,
                role: "customer",
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "7d",
              },
            );

            return res.json({
              message: "Google account created successfully",

              token,

              user: {
                id: userId,
                name: googleName,
                email: googleEmail,
                role: "customer",
              },
            });
          },
        );
      },
    );
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      message: "Unable to sign in with Google.",
    });
  }
};
