import "./Register.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";

import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) {
      return {
        label: "",
        width: "0%",
        level: "",
      };
    }

    if (password.length < 6) {
      return {
        label: "Weak",
        width: "30%",
        level: "weak",
      };
    }

    if (password.length < 10) {
      return {
        label: "Good",
        width: "65%",
        level: "medium",
      };
    }

    return {
      label: "Strong",
      width: "100%",
      level: "strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      toast.success("Registration Successful");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-container">
        {/* HEADER */}

        <header className="register-header">
          <div className="register-logo">
            <img src="/logo.png" alt="Masha Allah Creations" />
          </div>

          <div className="register-brand">
            <span>Masha Allah Creations</span>
            <small>Beautiful creations, made with love.</small>
          </div>
        </header>

        <div className="register-intro">
          <span className="register-label">CREATE ACCOUNT</span>

          <h1>Create your account</h1>

          <p>Sign up to enjoy a simpler and better shopping experience.</p>
        </div>

        {/* FORM CARD */}

        <form className="register-card" onSubmit={handleSubmit}>
          {/* PERSONAL DETAILS */}

          <section className="register-section">
            <div className="section-title">
              <div className="section-number">01</div>

              <div>
                <h2>Personal details</h2>
                <p>Your basic information</p>
              </div>
            </div>

            <div className="fields-grid">
              {/* NAME */}

              <div className="field">
                <label htmlFor="name">Full Name</label>

                <div className="input-container">
                  <FiUser />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* PHONE */}

              <div className="field">
                <label htmlFor="phone">
                  Phone Number
                  <span>Optional</span>
                </label>

                <div className="input-container">
                  <FiPhone />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="field field-full">
                <label htmlFor="email">Email Address</label>

                <div className="input-container">
                  <FiMail />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECURITY */}

          <section className="register-section">
            <div className="section-title">
              <div className="section-number">02</div>

              <div>
                <h2>Account security</h2>
                <p>Protect your account</p>
              </div>
            </div>

            <div className="fields-grid">
              {/* PASSWORD */}

              <div className="field">
                <label htmlFor="password">Password</label>

                <div className="input-container">
                  <FiLock />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-info">
                      <span>Password strength</span>

                      <strong className={passwordStrength.level}>
                        {passwordStrength.label}
                      </strong>
                    </div>

                    <div className="strength-bar">
                      <div
                        className={`strength-progress ${passwordStrength.level}`}
                        style={{
                          width: passwordStrength.width,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="field">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <div className="input-container">
                  <FiLock />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {formData.confirmPassword && (
                  <div
                    className={`password-status ${
                      formData.password === formData.confirmPassword
                        ? "matched"
                        : "not-matched"
                    }`}
                  >
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <FiCheck />
                        Passwords match
                      </>
                    ) : (
                      "Passwords do not match"
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SUBMIT */}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* LOGIN */}

          <div className="login-prompt">
            <span>Already have an account?</span>

            <Link to="/login">Login</Link>
          </div>
        </form>

        <footer className="register-footer">
          <span>© Masha Allah Creations</span>
          <span>Simple. Useful. Beautiful.</span>
        </footer>
      </div>
    </main>
  );
}

export default Register;
