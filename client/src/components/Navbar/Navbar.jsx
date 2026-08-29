import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";

import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiShield,
  FiPackage,
} from "react-icons/fi";

import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthenticated, logout, cartCount } = useAuth();

  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* LOGO */}

        <Link to="/" className="logo">
          <img src={logo} alt="HomeNeeds" />
        </Link>

        {/* MENU */}

        <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>

          <NavLink to="/cart" onClick={closeMenu}>
            Cart
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/orders" onClick={closeMenu}>
              Orders
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink to="/admin" onClick={closeMenu}>
              Admin Dashboard
            </NavLink>
          )}

          {!isAuthenticated && (
            <NavLink to="/login" onClick={closeMenu}>
              Login
            </NavLink>
          )}
        </nav>

        {/* SEARCH */}

        <div className="search-box">
          <FiSearch />

          <input type="text" placeholder="Search home essentials..." />
        </div>

        {/* RIGHT ICONS */}

        <div className="nav-icons">
          {/* CART */}

          <Link to="/cart" className="icon cart-icon">
            <FiShoppingCart />

            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* USER */}

          {isAuthenticated ? (
            <div className="user-dropdown">
              <div className="user-info">
                <FiUser />

                <span>{user?.name || "Account"}</span>
              </div>

              <div className="dropdown-menu">
                <Link to="/profile" onClick={closeMenu}>
                  <FiUser />
                  My Profile
                </Link>

                <Link to="/orders" onClick={closeMenu}>
                  <FiPackage />
                  My Orders
                </Link>

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="admin-dashboard-link"
                  >
                    <FiShield />
                    Admin Dashboard
                  </Link>
                )}

                <button onClick={handleLogout}>
                  <FiLogOut />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="icon">
              <FiUser />
            </Link>
          )}

          {/* MOBILE MENU */}

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
