import "./Login.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiLock,
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        {/* BRAND */}

        <header className="login-brand">
          <div className="login-logo">HN</div>

          <div className="login-brand-text">
            <span>HomeNeeds</span>
            <small>Everything your home needs.</small>
          </div>
        </header>

        {/* INTRO */}

        <div className="login-intro">
          <span className="login-label">WELCOME BACK</span>

          <h1>Sign in to your account</h1>

          <p>Continue shopping and manage your HomeNeeds account.</p>
        </div>

        {/* LOGIN CARD */}

        <div className="login-card">
          {/* ERROR */}

          {error && (
            <div className="login-error">
              <div className="error-icon">
                <FiAlertCircle />
              </div>

              <div>
                <strong>Unable to sign in</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div className="login-field">
              <label htmlFor="email">Email Address</label>

              <div className="login-input">
                <FiMail />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="login-field">
              <div className="password-label">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="login-input">
                <FiLock />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* OPTIONS */}

            <div className="login-options">
              <label className="remember-option">
                <span
                  className={`custom-checkbox ${
                    formData.remember ? "checked" : ""
                  }`}
                >
                  {formData.remember && <FiCheck />}

                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                </span>

                <span>Remember me</span>
              </label>
            </div>

            {/* SUBMIT */}

            <button type="submit" className="login-button" disabled={loading}>
              <span>{loading ? "Signing In..." : "Sign In"}</span>

              {!loading && <FiArrowRight />}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="login-divider">
            <span></span>
            <strong>OR</strong>
            <span></span>
          </div>

          {/* REGISTER */}

          <div className="new-account">
            <p>Don't have a HomeNeeds account?</p>

            <Link to="/register">
              Create Account
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* SECURITY NOTE */}

        <div className="login-footer">
          <div className="secure-badge">
            <FiLock />
          </div>

          <div>
            <strong>Secure shopping experience</strong>
            <span>Your account information is protected.</span>
          </div>
        </div>

        <div className="copyright">© HomeNeeds Store</div>
      </div>
    </main>
  );
}

export default Login;
