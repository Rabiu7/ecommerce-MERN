import "./ResetPassword.css";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${VITE_API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setSuccess(data.message || "Your password has been reset successfully.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-shell">
        <section className="reset-password-showcase">
          <Link to="/" className="reset-password-brand">
            <img src="/logo.png" alt="Online Bazaar logo" />
            <span>
              Online <strong>Bazaar</strong>
            </span>
          </Link>

          <div className="reset-password-showcase-content">
            <span className="reset-password-eyebrow">
              <FiShield />
              ACCOUNT SECURITY
            </span>

            <h1>
              A fresh start
              <br />
              begins <em>here.</em>
            </h1>

            <p>
              Create a new password to keep your Online Bazaar account secure
              and get back to shopping.
            </p>

            <div className="reset-password-benefit">
              <span className="reset-password-benefit-icon">
                <FiLock />
              </span>
              <div>
                <strong>Your account, protected</strong>
                <span>Choose a password only you know.</span>
              </div>
            </div>
          </div>

          <div className="reset-password-showcase-footer">
            YOUR SHOPPING JOURNEY, CONTINUED.
          </div>
        </section>

        <section className="reset-password-main">
          <Link to="/" className="reset-password-mobile-brand">
            <img src="/logo.png" alt="Online Bazaar logo" />
            <span>
              Online <strong>Bazaar</strong>
            </span>
          </Link>

          <div className="reset-password-content">
            <Link to="/login" className="reset-password-back">
              <span>←</span> Back to sign in
            </Link>

            <div className="reset-password-heading">
              <span className="reset-password-label">PASSWORD RECOVERY</span>
              <h2>Create a new password</h2>
              <p>Almost there! Choose a new password for your account.</p>
            </div>

            <div className="reset-password-card">
              {success && (
                <div className="reset-password-message reset-password-success">
                  <FiCheckCircle />
                  <div>
                    <strong>Password updated</strong>
                    <span>{success}</span>
                    <small>Redirecting you to sign in...</small>
                  </div>
                </div>
              )}

              {error && (
                <div className="reset-password-message reset-password-error">
                  <FiAlertCircle />
                  <div>
                    <strong>Unable to reset password</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {!success && (
                <form className="reset-password-form" onSubmit={handleSubmit}>
                  <div className="reset-password-field">
                    <label htmlFor="new-password">New password</label>

                    <div className="reset-password-input">
                      <FiLock className="reset-password-input-icon" />

                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="reset-password-eye"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="reset-password-field">
                    <label htmlFor="confirm-password">
                      Confirm new password
                    </label>

                    <div className="reset-password-input">
                      <FiLock className="reset-password-input-icon" />

                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                        required
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="reset-password-eye"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="reset-password-hint">
                    <FiShield />
                    <span>Use at least 6 characters for your password.</span>
                  </div>

                  <button
                    type="submit"
                    className="reset-password-button"
                    disabled={loading || !token}
                  >
                    <span>
                      {loading ? "Updating password..." : "Update password"}
                    </span>
                    {!loading && <FiArrowRight />}
                  </button>

                  {!token && (
                    <p className="reset-password-token-error">
                      The reset link is invalid or incomplete. Please request a
                      new password reset link.
                    </p>
                  )}
                </form>
              )}

              <div className="reset-password-divider">
                <span />
                <span>OR</span>
                <span />
              </div>

              <div className="reset-password-login">
                Remember your password? <Link to="/login">Sign in</Link>
              </div>
            </div>

            <p className="reset-password-security-note">
              <FiLock />
              Your password is sent securely to our server.
            </p>
          </div>

          <footer className="reset-password-copyright">
            © {new Date().getFullYear()} Online Bazaar. All rights reserved.
          </footer>
        </section>
      </div>
    </main>
  );
}

export default ResetPassword;
