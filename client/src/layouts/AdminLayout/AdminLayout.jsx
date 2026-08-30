import "./AdminLayout.css";
import logo from "../../assets/images/logo.png";

import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiStar,
  FiHome,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
} from "react-icons/fi";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* ================= SIDEBAR ================= */}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* LOGO */}
        <div className="admin-logo">
          <img src={logo} alt="HomeNeeds" />
        </div>

        {/* ADMIN PROFILE */}
        <div className="admin-profile">
          <div className="admin-avatar">
            <FiUser />
          </div>

          <div className="admin-profile-info">
            <h4>{user?.name || "Admin"}</h4>

            <span>Administrator</span>
          </div>
        </div>
        {/* NAVIGATION */}
        <nav className="admin-nav">
          <p className="nav-label">MAIN MENU</p>

          <NavLink to="/admin" end onClick={() => setSidebarOpen(false)}>
            <FiGrid />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/products" onClick={() => setSidebarOpen(false)}>
            <FiBox />
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/categories" onClick={() => setSidebarOpen(false)}>
            <FiTag />
            <span>Categories</span>
          </NavLink>

          <NavLink to="/admin/orders" onClick={() => setSidebarOpen(false)}>
            <FiShoppingBag />
            <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/customers" onClick={() => setSidebarOpen(false)}>
            <FiUsers />
            <span>Customers</span>
          </NavLink>

          <NavLink to="/admin/reviews" onClick={() => setSidebarOpen(false)}>
            <FiStar />
            <span>Reviews</span>
          </NavLink>

          <p className="nav-label bottom-label">SYSTEM</p>

          <NavLink to="/" onClick={() => setSidebarOpen(false)}>
            <FiHome />
            <span>Visit Store</span>
          </NavLink>

          <button className="admin-logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* ================= MOBILE OVERLAY ================= */}

      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ================= MAIN ================= */}

      <main className="admin-main">
        {/* ADMIN HEADER */}

        <header className="admin-header">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="admin-header-title">
            <h2>Admin Panel</h2>

            <span>Manage your HomeNeeds store</span>
          </div>

          <div className="admin-header-user">
            <div className="header-avatar">
              <FiUser />
            </div>

            <div className="header-user-info">
              <strong>{user?.name || "Admin"}</strong>

              <span>Administrator</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
