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

        console.log("Profile API Response:", data);

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

  console.log("Current User:", currentUser); // Debugging line to check the current user data

  const avatarName = encodeURIComponent(
    currentUser?.name || currentUser?.email || "User",
  );

  const avatarUrl = `https://ui-avatars.com/api/?name=${avatarName}&background=f3ede3&color=a27b3f&size=200&bold=true`;

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <div className="profile-heading profile-heading-loading">
            <span className="skeleton skeleton-label"></span>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-description"></div>
          </div>

          <div className="profile-layout">
            {/* PROFILE CARD SKELETON */}
            <div className="profile-card profile-card-loading">
              <div className="profile-cover">
                <div className="profile-avatar skeleton-avatar"></div>
              </div>

              <div className="profile-main profile-main-loading">
                <div className="skeleton skeleton-name"></div>
                <div className="skeleton skeleton-email"></div>

                <div className="skeleton skeleton-status"></div>

                <div className="skeleton skeleton-button"></div>
              </div>
            </div>

            {/* DETAILS SKELETON */}
            <div className="profile-details">
              <div className="details-header">
                <div>
                  <div className="skeleton skeleton-small-title"></div>
                  <div className="skeleton skeleton-section-title"></div>
                </div>

                <div className="skeleton details-icon-skeleton"></div>
              </div>

              <div className="details-grid">
                {[1, 2, 3, 4].map((item) => (
                  <div className="detail-item skeleton-detail" key={item}>
                    <div className="skeleton skeleton-detail-icon"></div>

                    <div className="skeleton-detail-content">
                      <div className="skeleton skeleton-detail-label"></div>
                      <div className="skeleton skeleton-detail-value"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* QUICK ACTIONS SKELETON */}
              <div className="quick-actions">
                {[1, 2, 3].map((item) => (
                  <div
                    className="quick-action skeleton-quick-action"
                    key={item}
                  >
                    <div className="skeleton skeleton-quick-icon"></div>

                    <div className="skeleton-quick-content">
                      <div className="skeleton skeleton-quick-title"></div>
                      <div className="skeleton skeleton-quick-text"></div>
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
        {/* PAGE HEADER */}

        <div className="profile-heading">
          <span>MY ACCOUNT</span>

          <h1>Welcome, {currentUser?.name || "User"}</h1>

          <p>Manage your profile and keep your account details up to date.</p>
        </div>

        {/* MAIN */}

        <div className="profile-layout">
          {/* PROFILE CARD */}

          <div className="profile-card">
            <div className="profile-cover">
              <div className="profile-avatar">
                <img src={avatarUrl} alt={currentUser?.name || "Profile"} />
              </div>
            </div>

            <div className="profile-main">
              <h2>{currentUser?.name || "User"}</h2>

              <p className="profile-email">
                {currentUser?.email || "No email available"}
              </p>

              <div className="profile-status">
                <span></span>
                Active Account
              </div>

              <button
                className="edit-profile-btn"
                onClick={() => navigate("/profile/edit")}
              >
                <FiEdit3 />
                Edit Profile
              </button>
            </div>
          </div>

          {/* DETAILS */}

          <div className="profile-details">
            <div className="details-header">
              <div>
                <span>PERSONAL INFORMATION</span>
                <h2>Account Details</h2>
              </div>

              <div className="details-icon">
                <FiUser />
              </div>
            </div>

            <div className="details-grid">
              {/* NAME */}

              <div className="detail-item">
                <div className="detail-icon">
                  <FiUser />
                </div>

                <div>
                  <span>Full Name</span>

                  <strong>{currentUser?.name || "Not available"}</strong>
                </div>
              </div>

              {/* EMAIL */}

              <div className="detail-item">
                <div className="detail-icon">
                  <FiMail />
                </div>

                <div>
                  <span>Email Address</span>

                  <strong>{currentUser?.email || "Not available"}</strong>
                </div>
              </div>

              {/* PHONE */}

              <div className="detail-item">
                <div className="detail-icon">
                  <FiPhone />
                </div>

                <div>
                  <span>Phone Number</span>

                  <strong>{currentUser?.phone || "Not added"}</strong>
                </div>
              </div>

              {/* ROLE */}

              <div className="detail-item">
                <div className="detail-icon">
                  <FiUser />
                </div>

                <div>
                  <span>Account Type</span>

                  <strong>
                    {currentUser?.role === "admin"
                      ? "Administrator"
                      : "Customer"}
                  </strong>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="quick-actions">
              <button
                className="quick-action"
                onClick={() => navigate("/orders")}
              >
                <FiPackage />

                <div>
                  <strong>My Orders</strong>
                  <span>View your order history</span>
                </div>
              </button>

              <button
                className="quick-action"
                onClick={() => navigate("/wishlist")}
              >
                <FiHeart />

                <div>
                  <strong>Wishlist</strong>
                  <span>Products you've saved</span>
                </div>
              </button>

              <button
                className="quick-action logout-action"
                onClick={handleLogout}
              >
                <FiLogOut />

                <div>
                  <strong>Logout</strong>
                  <span>Sign out of your account</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
