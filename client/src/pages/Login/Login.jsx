import "./Login.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

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

    setFormData((prev) => ({
      ...prev,
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
    <section className="login-page">
      <div className="login-card">
        <div className="login-left">
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80"
            alt="Home"
          />

          <div className="overlay">
            <h2>HomeNeeds</h2>

            <p>Elegant essentials for a beautiful home.</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <span>WELCOME BACK</span>

            <h1>Sign In</h1>

            <p>Login to continue shopping.</p>
          </div>

          {error && (
            <div className="error-box">
              <FiAlertCircle />

              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-box">
              <FiMail />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <FiLock />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                Remember me
              </label>

              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button className="login-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="register-link">
              Don't have an account?
              <Link to="/register">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
