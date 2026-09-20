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
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
          body: JSON.stringify({
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setSuccess(data.message || "Password has been reset successfully.");

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
      <div className="reset-password-container">
        {/* BRAND */}

        <header className="reset-password-brand">
          <div className="reset-password-logo">MAC</div>

          <div className="reset-password-brand-text">
            <span>Masha Allah Creations</span>
            <small>Customized gifts made with love.</small>
          </div>
        </header>

        {/* INTRO */}

        <div className="reset-password-intro">
          <span className="reset-password-label">PASSWORD RECOVERY</span>

          <h1>Create a new password</h1>

          <p>Choose a new password for your Masha Allah Creations account.</p>
        </div>

        {/* CARD */}

        <div className="reset-password-card">
          {/* SUCCESS */}

          {success && (
            <div className="reset-password-success">
              <div className="success-icon">
                <FiCheckCircle />
              </div>

              <div>
                <strong>Password updated</strong>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="reset-password-error">
              <div className="error-icon">
                <FiAlertCircle />
              </div>

              <div>
                <strong>Unable to reset password</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!success && (
            <form className="reset-password-form" onSubmit={handleSubmit}>
              {/* PASSWORD */}

              <div className="reset-password-field">
                <label htmlFor="new-password">New Password</label>

                <div className="reset-password-input">
                  <FiLock />

                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="reset-password-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="reset-password-field">
                <label htmlFor="confirm-password">Confirm Password</label>

                <div className="reset-password-input">
                  <FiLock />

                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="reset-password-eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <p className="reset-password-hint">
                Password must contain at least 6 characters.
              </p>

              {/* SUBMIT */}

              <button
                type="submit"
                className="reset-password-button"
                disabled={loading}
              >
                <span>{loading ? "Updating..." : "Update Password"}</span>

                {!loading && <FiArrowRight />}
              </button>
            </form>
          )}

          {/* LOGIN */}

          <div className="reset-password-login">
            <Link to="/login">Back to Sign In</Link>
          </div>
        </div>

        <div className="reset-password-copyright">© Masha Allah Creations</div>
      </div>
    </main>
  );
}

export default ResetPassword;
