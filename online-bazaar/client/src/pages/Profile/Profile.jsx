import "./Profile.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit3,
  FiPackage,
  FiHeart,
  FiLogOut,
  FiArrowUpRight,
  FiShield,
  FiChevronRight,
  FiCheckCircle,
  FiSettings,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../services/profileService";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProfile(user.id);
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const currentUser = profile || user;
  const displayName = currentUser?.name || "User";
  const displayEmail = currentUser?.email || "No email available";
  const displayPhone = currentUser?.phone || "Not added";

  const avatarName = encodeURIComponent(
    currentUser?.name || currentUser?.email || "User",
  );

  const avatarUrl = `https://ui-avatars.com/api/?name=${avatarName}&background=f9e7b1&color=79540c&size=240&bold=true`;

  const accountType =
    currentUser?.role === "admin" ? "Administrator" : "Customer";

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <div className="profile-heading">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-description" />
          </div>

          <div className="profile-layout">
            <div className="profile-card profile-card-loading">
              <div className="profile-cover">
                <div className="profile-avatar skeleton-avatar" />
              </div>

              <div className="profile-main profile-main-loading">
                <div className="skeleton skeleton-name" />
                <div className="skeleton skeleton-email" />
                <div className="skeleton skeleton-status" />
                <div className="skeleton skeleton-button" />
              </div>
            </div>

            <div className="profile-details">
              <div className="details-header">
                <div>
                  <div className="skeleton skeleton-small-title" />
                  <div className="skeleton skeleton-section-title" />
                </div>
                <div className="skeleton details-icon-skeleton" />
              </div>

              <div className="details-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div className="detail-item skeleton-detail" key={item}>
                    <div className="skeleton skeleton-detail-icon" />
                    <div className="skeleton-detail-content">
                      <div className="skeleton skeleton-detail-label" />
                      <div className="skeleton skeleton-detail-value" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="quick-actions">
                {[1, 2, 3].map((item) => (
                  <div
                    className="quick-action skeleton-quick-action"
                    key={item}
                  >
                    <div className="skeleton skeleton-quick-icon" />
                    <div className="skeleton-quick-content">
                      <div className="skeleton skeleton-quick-title" />
                      <div className="skeleton skeleton-quick-text" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-container">
        {/* PAGE INTRODUCTION */}
        <header className="profile-heading">
          <div className="profile-eyebrow">
            <span className="profile-eyebrow-line" />
            MY ACCOUNT
            <span className="profile-eyebrow-line" />
          </div>

          <h1>
            Your account,
            <span className="profile-heading-highlight"> your way.</span>
          </h1>

          <p>
            Welcome back, {displayName}. Manage your personal information and
            keep everything in one place.
          </p>
        </header>

        {/* ACCOUNT OVERVIEW */}
        <div className="profile-layout">
          <aside className="profile-card">
            <div className="profile-cover">
              <div className="profile-cover-content">
                <span className="profile-cover-label">MEMBER PROFILE</span>
                <FiShield className="profile-cover-shield" />
              </div>

              <div className="profile-avatar">
                <img src={avatarUrl} alt={`${displayName}'s profile`} />
              </div>
            </div>

            <div className="profile-main">
              <div className="profile-member-label">
                <FiCheckCircle />
                YOUR ACCOUNT
              </div>

              <h2>{displayName}</h2>

              <p className="profile-email">{displayEmail}</p>

              <div className="profile-status">
                <span className="profile-status-dot" />
                Active Account
              </div>

              <div className="profile-card-divider" />

              <div className="profile-card-meta">
                <div className="profile-card-meta-icon">
                  <FiShield />
                </div>

                <div>
                  <span>Account type</span>
                  <strong>{accountType}</strong>
                </div>

                <FiChevronRight className="profile-meta-chevron" />
              </div>

              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => navigate("/profile/edit")}
              >
                <FiEdit3 />
                Edit Profile
                <FiArrowUpRight className="profile-button-arrow" />
              </button>

              <p className="profile-card-note">
                Keep your details accurate for a smoother shopping experience.
              </p>
            </div>
          </aside>

          {/* MAIN ACCOUNT CONTENT */}
          <main className="profile-content">
            {/* PERSONAL INFORMATION */}
            <section className="profile-details">
              <div className="details-header">
                <div>
                  <span className="details-eyebrow">YOUR INFORMATION</span>
                  <h2>Personal details</h2>
                  <p>Review the information associated with your account.</p>
                </div>

                <div className="details-icon">
                  <FiUser />
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiUser />
                  </div>

                  <div className="detail-content">
                    <span>Full name</span>
                    <strong>{displayName}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <FiMail />
                  </div>

                  <div className="detail-content">
                    <span>Email address</span>
                    <strong title={displayEmail}>{displayEmail}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <FiPhone />
                  </div>

                  <div className="detail-content">
                    <span>Phone number</span>
                    <strong>{displayPhone}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <FiShield />
                  </div>

                  <div className="detail-content">
                    <span>Account type</span>
                    <strong>{accountType}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="profile-inline-edit"
                onClick={() => navigate("/profile/edit")}
              >
                <FiSettings />
                Update personal information
                <FiArrowUpRight />
              </button>
            </section>

            {/* ACCOUNT SHORTCUTS */}
            <section className="profile-shortcuts">
              <div className="shortcuts-heading">
                <div>
                  <span className="details-eyebrow">QUICK ACCESS</span>
                  <h2>Manage your account</h2>
                </div>

                <span className="shortcuts-count">03 OPTIONS</span>
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  className="quick-action"
                  onClick={() => navigate("/orders")}
                >
                  <div className="quick-action-icon">
                    <FiPackage />
                  </div>

                  <div className="quick-action-content">
                    <strong>My Orders</strong>
                    <span>Track purchases and view order history.</span>
                  </div>

                  <FiChevronRight className="quick-action-arrow" />
                </button>

                <button
                  type="button"
                  className="quick-action"
                  onClick={() => navigate("/wishlist")}
                >
                  <div className="quick-action-icon">
                    <FiHeart />
                  </div>

                  <div className="quick-action-content">
                    <strong>My Wishlist</strong>
                    <span>Find the products you have saved.</span>
                  </div>

                  <FiChevronRight className="quick-action-arrow" />
                </button>

                <button
                  type="button"
                  className="quick-action logout-action"
                  onClick={handleLogout}
                >
                  <div className="quick-action-icon">
                    <FiLogOut />
                  </div>

                  <div className="quick-action-content">
                    <strong>Sign Out</strong>
                    <span>Securely log out of your account.</span>
                  </div>

                  <FiChevronRight className="quick-action-arrow" />
                </button>
              </div>
            </section>

            {/* BOTTOM TRUST NOTE */}
            <div className="profile-trust-note">
              <div className="profile-trust-icon">
                <FiShield />
              </div>

              <div>
                <strong>Your account matters</strong>
                <p>
                  Keep your contact information up to date for order
                  notifications and a better shopping experience.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default Profile;
