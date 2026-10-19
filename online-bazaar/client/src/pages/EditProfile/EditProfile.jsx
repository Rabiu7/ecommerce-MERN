import "./EditProfile.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiArrowLeft,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiArrowUpRight,
  FiEdit3,
} from "react-icons/fi";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/profileService";

function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProfile(user.id);

        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!user?.id) {
      toast.error("Please log in to update your profile");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      await updateProfile(user.id, updatedData);

      updateUser(updatedData);

      toast.success("Profile updated successfully");

      setTimeout(() => {
        navigate("/profile");
      }, 800);
    } catch (error) {
      console.error("Update profile error:", error);

      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="edit-profile-page">
        <div className="edit-profile-container">
          <div className="edit-profile-loading-card">
            <div className="edit-profile-loader" />
            <h2>Preparing your profile</h2>
            <p>Please wait while we load your account information.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="edit-profile-page">
      <div className="edit-profile-container">
        {/* TOP NAVIGATION */}
        <div className="edit-profile-topbar">
          <button
            type="button"
            className="back-profile-btn"
            onClick={() => navigate("/profile")}
          >
            <FiArrowLeft />
            <span>Back to Profile</span>
          </button>

          <div className="edit-security-label">
            <FiShield />
            Secure Account Settings
          </div>
        </div>

        {/* PAGE INTRODUCTION */}
        <header className="edit-profile-heading">
          <div className="edit-profile-eyebrow">
            <span />
            MY ACCOUNT
          </div>

          <h1>
            Make it <span>personal.</span>
          </h1>

          <p>
            Keep your information up to date for a smoother, more personalised
            shopping experience.
          </p>
        </header>

        {/* MAIN CONTENT */}
        <div className="edit-profile-layout">
          {/* FORM PANEL */}
          <main className="edit-profile-card">
            <div className="edit-card-header">
              <div className="edit-avatar">
                <FiEdit3 />
              </div>

              <div className="edit-card-heading-text">
                <span>PERSONAL INFORMATION</span>
                <h2>Edit your details</h2>
                <p>Update the information associated with your account.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* FULL NAME */}
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="field-required">*</span>
                </label>

                <div className="input-wrapper">
                  <FiUser />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <p className="field-hint">
                  <FiCheckCircle />
                  Your name as it appears on your account.
                </p>
              </div>

              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="field-required">*</span>
                </label>

                <div className="input-wrapper">
                  <FiMail />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </div>

                <p className="field-hint">
                  <FiShield />
                  Used for account communication and order updates.
                </p>
              </div>

              {/* PHONE */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>

                <div className="input-wrapper">
                  <FiPhone />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                </div>

                <p className="field-hint">
                  Optional — add a phone number for easier contact.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="cancel-profile-btn"
                  onClick={() => navigate("/profile")}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-profile-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="save-button-spinner" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Changes
                      <FiArrowUpRight className="save-button-arrow" />
                    </>
                  )}
                </button>
              </div>

              <p className="edit-form-footnote">
                <FiShield />
                Your account information is handled securely.
              </p>
            </form>
          </main>

          {/* SIDE INFORMATION PANEL */}
          <aside className="edit-profile-sidebar">
            <div className="edit-sidebar-banner">
              <div className="edit-sidebar-icon">
                <FiUser />
              </div>

              <span>YOUR ACCOUNT</span>

              <h2>
                The details
                <br />
                that make you, you.
              </h2>

              <p>
                A few up-to-date details help make every shopping experience
                feel more personal.
              </p>

              <div className="edit-sidebar-decoration">
                <FiShield />
              </div>
            </div>

            <div className="edit-sidebar-info">
              <span className="edit-sidebar-eyebrow">PROFILE CHECKLIST</span>

              <h3>Keep things current</h3>

              <div className="edit-checklist-item">
                <div className="edit-check-icon">
                  <FiUser />
                </div>

                <div>
                  <strong>Personal details</strong>
                  <p>Make sure your name is correct.</p>
                </div>
              </div>

              <div className="edit-checklist-item">
                <div className="edit-check-icon">
                  <FiMail />
                </div>

                <div>
                  <strong>Contact information</strong>
                  <p>Use an email address you can access.</p>
                </div>
              </div>

              <div className="edit-checklist-item">
                <div className="edit-check-icon">
                  <FiPhone />
                </div>

                <div>
                  <strong>Phone number</strong>
                  <p>Add a number if you want to be reachable.</p>
                </div>
              </div>
            </div>

            <div className="edit-sidebar-note">
              <FiShield />

              <p>
                <strong>Your account, your control.</strong>
                <br />
                Review your details before saving your changes.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default EditProfile;
