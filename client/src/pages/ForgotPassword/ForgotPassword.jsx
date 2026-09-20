import "./ForgotPassword.css";

import { Link } from "react-router-dom";
import { useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

import {
  FiMail,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(`${VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setSuccess(
        data.message ||
          "If an account exists with this email address, a password reset link will be sent.",
      );
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(err.message || "Unable to process your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-container">
        {/* BRAND */}

        <header className="forgot-password-brand">
          <div className="forgot-password-logo">MAC</div>

          <div className="forgot-password-brand-text">
            <span>Masha Allah Creations</span>
            <small>Customized gifts made with love.</small>
          </div>
        </header>

        {/* INTRO */}

        <div className="forgot-password-intro">
          <span className="forgot-password-label">PASSWORD RECOVERY</span>

          <h1>Forgot your password?</h1>

          <p>
            Enter your email address and we'll help you reset your password.
          </p>
        </div>

        {/* CARD */}

        <div className="forgot-password-card">
          {/* SUCCESS */}

          {success && (
            <div className="forgot-password-success">
              <div className="success-icon">
                <FiCheckCircle />
              </div>

              <div>
                <strong>Check your email</strong>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="forgot-password-error">
              <div className="error-icon">
                <FiAlertCircle />
              </div>

              <div>
                <strong>Unable to continue</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="forgot-password-form" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div className="forgot-password-field">
              <label htmlFor="forgot-email">Email Address</label>

              <div className="forgot-password-input">
                <FiMail />

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="forgot-password-button"
              disabled={loading}
            >
              <span>{loading ? "Sending..." : "Send Reset Link"}</span>

              {!loading && <FiArrowRight />}
            </button>
          </form>

          {/* BACK TO LOGIN */}

          <div className="forgot-password-back">
            <Link to="/login">
              <FiArrowLeft />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        {/* SECURITY */}

        <div className="forgot-password-footer">
          <div className="secure-badge">
            <FiLock />
          </div>

          <div>
            <strong>Your account is secure</strong>
            <span>We'll never ask for your password through email.</span>
          </div>
        </div>

        <div className="forgot-password-copyright">© Masha Allah Creations</div>
      </div>
    </main>
  );
}

export default ForgotPassword;
