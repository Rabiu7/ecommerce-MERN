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
  FiShield,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";

import { GoogleLogin } from "@react-oauth/google";

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

  const redirectUser = (user) => {
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  // EMAIL / PASSWORD LOGIN
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
      redirectUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");

      if (!credentialResponse?.credential) {
        throw new Error("Google sign in failed.");
      }

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google sign in failed.");
      }

      login(data.user, data.token);
      redirectUser(data.user);
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        err.message || "Unable to sign in with Google. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign in failed. Please try again.");
  };

  return (
    <main className="login-page">
      <div className="login-layout">
        {/* LEFT BRAND PANEL */}
        <aside className="login-showcase">
          <Link to="/" className="login-brand">
            <img
              src="/logo.png"
              alt="Online Bazaar"
              className="login-brand-logo"
            />

            <span className="login-brand-name">
              Masha Allah
              <strong>Creations</strong>
            </span>
          </Link>

          <div className="showcase-content">
            <span className="showcase-eyebrow">
              <FiStar />
              YOUR EVERYDAY BAZAAR
            </span>

            <h1>
              Thoughtful finds.
              <br />
              <span>Beautiful living.</span>
            </h1>

            <p className="showcase-description">
              Discover everyday essentials and lovely finds, all in one place.
              Your next favourite purchase is just around the corner.
            </p>

            <div className="showcase-features">
              <div className="showcase-feature">
                <span className="feature-icon">
                  <FiShoppingBag />
                </span>

                <div>
                  <strong>Explore your favourites</strong>
                  <p>Find something special for every day.</p>
                </div>
              </div>

              <div className="showcase-feature">
                <span className="feature-icon">
                  <FiShield />
                </span>

                <div>
                  <strong>Shop with confidence</strong>
                  <p>A convenient shopping experience.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-bottom">
            <span className="showcase-bottom-line" />
            <p>Made for your everyday needs.</p>
          </div>

          <div className="showcase-decoration showcase-decoration-one" />
          <div className="showcase-decoration showcase-decoration-two" />
        </aside>

        {/* RIGHT LOGIN SECTION */}
        <section className="login-main">
          <div className="login-main-top">
            <Link to="/" className="back-to-store">
              <FiArrowRight className="back-arrow" />
              Back to store
            </Link>

            <div className="login-register-link">
              New here?
              <Link to="/register">Create account</Link>
            </div>
          </div>

          <div className="login-content">
            <header className="login-heading">
              <span className="login-label">WELCOME BACK</span>

              <h2>Sign in to your account</h2>

              <p>Enter your details below to continue your shopping journey.</p>
            </header>

            {/* LOGIN CARD */}
            <div className="login-card">
              {error && (
                <div className="login-error" role="alert">
                  <span className="error-icon">
                    <FiAlertCircle />
                  </span>

                  <div className="error-content">
                    <strong>Unable to sign in</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form className="login-form" onSubmit={handleSubmit}>
                {/* EMAIL */}
                <div className="login-field">
                  <label htmlFor="email">Email address</label>

                  <div className="login-input">
                    <FiMail className="input-icon" />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="login-field">
                  <div className="password-label">
                    <label htmlFor="password">Password</label>

                    <Link to="/forgot-password">Forgot password?</Link>
                  </div>

                  <div className="login-input">
                    <FiLock className="input-icon" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="login-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}
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
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  <span>{loading ? "Signing you in..." : "Sign in"}</span>

                  {!loading && <FiArrowRight />}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="login-divider">
                <span />
                <p>OR CONTINUE WITH</p>
                <span />
              </div>

              {/* GOOGLE LOGIN */}
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  shape="rectangular"
                  size="large"
                  width="320"
                  theme="outline"
                />
              </div>

              {/* REGISTER */}
              <div className="new-account">
                <p>Don't have an account yet?</p>

                <Link to="/register">
                  Create your account
                  <FiArrowRight />
                </Link>
              </div>
            </div>

            {/* SECURITY INFORMATION */}
            <div className="login-security">
              <span className="security-icon">
                <FiShield />
              </span>

              <div>
                <strong>Your shopping, your account</strong>
                <p>Sign in securely to access your account.</p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="login-footer">
            <span>© {new Date().getFullYear()} Online Bazaar</span>
            <span className="footer-separator">·</span>
            <span>Made for everyday living</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Login;
