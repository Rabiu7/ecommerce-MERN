import "./AdminLogin.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";

import { toast } from "react-toastify";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(formData);

      if (data.user.role !== "admin") {
        toast.error("Access denied. Admin account required.");
        return;
      }

      login(data.user, data.token);

      toast.success(`Welcome back, ${data.user.name}!`);

      navigate("/admin");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-brand">
          <div className="admin-shield">
            <FiShield />
          </div>

          <h1>
            Home<span>Needs</span>
          </h1>

          <p>Administration Portal</p>

          <div className="admin-login-line"></div>

          <small>Secure access for HomeNeeds administrators.</small>
        </div>

        <div className="admin-login-form-container">
          <div className="admin-login-header">
            <span className="admin-label">ADMINISTRATOR</span>

            <h2>Welcome Back</h2>

            <p>Sign in to manage your HomeNeeds store.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-input-box">
              <FiMail />

              <input
                type="email"
                name="email"
                placeholder="Admin email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="admin-input-box">
              <FiLock />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="admin-security">
            <FiShield />

            <span>Protected administrator access</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
