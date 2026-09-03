import "./EditProfile.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiUser, FiMail, FiPhone, FiArrowLeft, FiSave } from "react-icons/fi";

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

  // ==========================================
  // FETCH PROFILE
  // ==========================================

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

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

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

    try {
      setSaving(true);

      await updateProfile(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      updateUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="edit-profile-page">
        <div className="edit-profile-loading">
          <div className="edit-profile-loader"></div>
          <p>Loading your profile...</p>
        </div>
      </section>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <section className="edit-profile-page">
      <div className="edit-profile-container">
        {/* HEADER */}

        <div className="edit-profile-heading">
          <button
            className="back-profile-btn"
            onClick={() => navigate("/profile")}
          >
            <FiArrowLeft />
            Back to Profile
          </button>

          <span>MY ACCOUNT</span>

          <h1>Edit Profile</h1>

          <p>
            Update your personal information and keep your account details up to
            date.
          </p>
        </div>

        {/* CARD */}

        <div className="edit-profile-card">
          {/* CARD HEADER */}

          <div className="edit-card-header">
            <div className="edit-avatar">
              <FiUser />
            </div>

            <div>
              <span>PERSONAL INFORMATION</span>
              <h2>Account Details</h2>
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* NAME */}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <div className="input-wrapper">
                <FiUser />

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <FiMail />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                />
              </div>
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
                />
              </div>
            </div>

            {/* BUTTONS */}

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
                <FiSave />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default EditProfile;
