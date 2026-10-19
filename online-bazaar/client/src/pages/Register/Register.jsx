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
  FiArrowRight,
  FiShield,
  FiShoppingBag,
  FiStar,
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
      return { label: "", width: "0%", level: "" };
    }

    if (password.length < 6) {
      return { label: "Weak", width: "30%", level: "weak" };
    }

    if (password.length < 10) {
      return { label: "Good", width: "65%", level: "medium" };
    }

    return { label: "Strong", width: "100%", level: "strong" };
  };

  const passwordStrength = getPasswordStrength();

  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
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
      <div className="register-layout">
        {/* LEFT BRANDING PANEL */}
        <aside className="register-showcase">
          <Link to="/" className="register-brand">
            <img
              src="/logo.png"
              alt="Online Bazaar logo"
              className="register-brand-logo"
            />

            <span className="register-brand-name">
              Online <strong>Bazaar</strong>
            </span>
          </Link>

          <div className="register-showcase-content">
            <span className="register-showcase-label">
              <FiStar />
              YOUR EVERYDAY BAZAAR
            </span>

            <h1>
              A little more
              <br />
              <span>joy in every day.</span>
            </h1>

            <p className="register-showcase-description">
              Create your account and discover a convenient way to shop for the
              things you need and love.
            </p>

            <div className="register-benefits">
              <div className="register-benefit">
                <span className="register-benefit-icon">
                  <FiShoppingBag />
                </span>

                <div>
                  <strong>Discover more</strong>
                  <p>Explore everyday essentials in one place.</p>
                </div>
              </div>

              <div className="register-benefit">
                <span className="register-benefit-icon">
                  <FiShield />
                </span>

                <div>
                  <strong>Your account, your way</strong>
                  <p>Manage your details in one convenient place.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="register-showcase-footer">
            <span />
            <p>Welcome to a better way to shop.</p>
          </div>

          <div className="register-decoration register-decoration-one" />
          <div className="register-decoration register-decoration-two" />
        </aside>

        {/* RIGHT REGISTRATION SECTION */}
        <section className="register-main">
          <header className="register-topbar">
            <Link to="/" className="register-back-link">
              <FiArrowRight />
              Back to store
            </Link>

            <div className="register-existing-account">
              Already a member?
              <Link to="/login">Sign in</Link>
            </div>
          </header>

          <div className="register-content">
            <div className="register-heading">
              <span className="register-eyebrow">JOIN ONLINE BAZAAR</span>

              <h2>Create your account</h2>

              <p>Just a few details to get you started.</p>
            </div>

            <form className="register-card" onSubmit={handleSubmit}>
              {/* PERSONAL DETAILS */}
              <section className="register-section">
                <div className="register-section-heading">
                  <span className="register-section-number">01</span>

                  <div>
                    <h3>Personal details</h3>
                    <p>Tell us a little about yourself.</p>
                  </div>
                </div>

                <div className="register-fields-grid">
                  {/* NAME */}
                  <div className="register-field register-field-full">
                    <label htmlFor="name">Full name</label>

                    <div className="register-input">
                      <FiUser className="register-input-icon" />

                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="register-field register-field-full">
                    <label htmlFor="email">Email address</label>

                    <div className="register-input">
                      <FiMail className="register-input-icon" />

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

                  {/* PHONE */}
                  <div className="register-field register-field-full">
                    <label htmlFor="phone">
                      Phone number
                      <span className="register-optional">Optional</span>
                    </label>

                    <div className="register-input">
                      <FiPhone className="register-input-icon" />

                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="register-section-divider" />

              {/* ACCOUNT SECURITY */}
              <section className="register-section">
                <div className="register-section-heading">
                  <span className="register-section-number">02</span>

                  <div>
                    <h3>Account security</h3>
                    <p>Create a password for your account.</p>
                  </div>
                </div>

                <div className="register-fields-grid">
                  {/* PASSWORD */}
                  <div className="register-field">
                    <label htmlFor="password">Password</label>

                    <div className="register-input">
                      <FiLock className="register-input-icon" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="register-eye-button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {formData.password && (
                      <div className="register-password-strength">
                        <div className="register-strength-info">
                          <span>Password strength</span>

                          <strong className={passwordStrength.level}>
                            {passwordStrength.label}
                          </strong>
                        </div>

                        <div className="register-strength-track">
                          <div
                            className={`register-strength-progress ${passwordStrength.level}`}
                            style={{
                              width: passwordStrength.width,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="register-field">
                    <label htmlFor="confirmPassword">Confirm password</label>

                    <div
                      className={`register-input ${
                        formData.confirmPassword
                          ? passwordsMatch
                            ? "register-input-matched"
                            : "register-input-unmatched"
                          : ""
                      }`}
                    >
                      <FiLock className="register-input-icon" />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        className="register-eye-button"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>

                    {formData.confirmPassword && (
                      <div
                        className={`register-password-status ${
                          passwordsMatch ? "matched" : "not-matched"
                        }`}
                      >
                        {passwordsMatch ? (
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
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                <span>
                  {loading ? "Creating your account..." : "Create account"}
                </span>

                {!loading && <FiArrowRight />}
              </button>

              <p className="register-terms-note">
                By creating an account, you can manage your Online Bazaar
                profile and shopping details.
              </p>

              {/* LOGIN LINK */}
              <div className="register-login-prompt">
                <span>Already have an account?</span>

                <Link to="/login">
                  Sign in
                  <FiArrowRight />
                </Link>
              </div>
            </form>

            {/* SECURITY NOTE */}
            <div className="register-security-note">
              <span className="register-security-icon">
                <FiShield />
              </span>

              <div>
                <strong>Your account starts here</strong>
                <p>Use a password you don't use on other websites.</p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="register-footer">
            <span>© {new Date().getFullYear()} Online Bazaar</span>
            <span className="register-footer-dot">·</span>
            <span>Simple. Useful. Beautiful.</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Register;
