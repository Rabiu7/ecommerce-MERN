import "./Navbar.css";

import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiShield,
  FiPackage,
  FiTruck,
  FiArrowRight,
  FiTag,
  FiChevronDown,
} from "react-icons/fi";
import { useEffect, useMemo, useRef, useState } from "react";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const searchRef = useRef(null);

  const { user, isAuthenticated, logout, cartCount } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  // Fetch products for live search suggestions.
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await fetch(`${VITE_API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : [];

        if (!cancelled) {
          setProducts(productList);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Navbar product search error:", error);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter suggestions by product name or category.
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return [];
    }

    return products
      .filter((product) => {
        const name = String(product.name || "").toLowerCase();
        const category = String(
          product.category_name || product.category || "",
        ).toLowerCase();

        return name.includes(term) || category.includes(term);
      })
      .slice(0, 6);
  }, [searchTerm, products]);

  // Close suggestions when clicking outside and close the mobile menu on Escape.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowSuggestions(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const term = searchTerm.trim();

    if (!term) {
      toast.info("Enter a product name to search");
      return;
    }

    setShowSuggestions(false);
    closeMenu();

    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleProductClick = (product) => {
    setSearchTerm("");
    setShowSuggestions(false);
    closeMenu();

    navigate(`/products/${product.public_id}`);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    setShowSuggestions(false);
    navigate("/");
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to access your cart");
      navigate("/login");
      return;
    }

    closeMenu();
    navigate("/cart");
  };

  const getProductImage = (image) => {
    if (!image) {
      return "/placeholder-product.png";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    return image.startsWith("/") ? image : `/${image}`;
  };

  return (
    <header className="navbar">
      {/* Announcement strip */}
      <div className="navbar-announcement">
        <div className="navbar-announcement-inner">
          <div className="announcement-message">
            <span className="announcement-icon">
              <FiTruck />
            </span>

            <span>Everyday essentials, delivered to your doorstep</span>
          </div>

          <Link to="/products" className="announcement-link">
            <span>Discover the collection</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Main header */}
      <div className="navbar-main">
        <div className="navbar-container">
          <Link
            to="/"
            className="navbar-brand"
            aria-label="Online Bazaar home"
            onClick={closeMenu}
          >
            <span className="navbar-logo-frame">
              <img src={logo} alt="Online Bazaar" />
            </span>

            <span className="navbar-brand-copy">
              <span className="navbar-brand-name">Online Bazaar</span>
              <span className="navbar-brand-tagline">EVERYDAY FINDS</span>
            </span>
          </Link>

          {/* Product search */}
          <div className="search-container" ref={searchRef}>
            <form className="search-box" onSubmit={handleSearch}>
              <FiSearch className="search-main-icon" />

              <input
                type="search"
                value={searchTerm}
                placeholder="Search products and categories..."
                aria-label="Search products"
                aria-expanded={showSuggestions && searchTerm.trim() !== ""}
                aria-controls="navbar-search-suggestions"
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchTerm("");
                    setShowSuggestions(false);
                  }}
                >
                  <FiX />
                </button>
              )}

              <button type="submit" className="search-submit-btn">
                Search
              </button>
            </form>

            {showSuggestions && searchTerm.trim() !== "" && (
              <div
                id="navbar-search-suggestions"
                className="search-suggestions"
              >
                <div className="search-suggestions-top">
                  <span className="search-heading">
                    <FiSearch />
                    Suggestions
                  </span>

                  {!productsLoading && (
                    <span className="search-result-count">
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "result" : "results"}
                    </span>
                  )}
                </div>

                {productsLoading ? (
                  <div className="search-message" role="status">
                    <span className="search-loading-dot" />
                    Finding products...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-result-list">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="search-result"
                          onClick={() => handleProductClick(product)}
                        >
                          <span className="search-result-image">
                            <img
                              src={getProductImage(product.image)}
                              alt=""
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src =
                                  "/placeholder-product.png";
                              }}
                            />
                          </span>

                          <span className="search-result-info">
                            <span className="search-result-name">
                              {product.name}
                            </span>

                            <span className="search-result-category">
                              {product.category_name ||
                                product.category ||
                                "Everyday essential"}
                            </span>

                            {product.price !== undefined && (
                              <span className="search-result-price">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </span>
                            )}
                          </span>

                          <FiArrowRight className="search-result-arrow" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="search-view-all"
                      onClick={handleSearch}
                    >
                      <span>
                        View all results for <strong>"{searchTerm}"</strong>
                      </span>
                      <FiArrowRight />
                    </button>
                  </>
                ) : (
                  <div className="search-no-results">
                    <span className="search-no-results-icon">
                      <FiSearch />
                    </span>

                    <strong>No products found</strong>

                    <span>
                      We couldn't find anything matching "{searchTerm}".
                    </span>

                    <button
                      type="button"
                      onClick={handleSearch}
                      className="search-browse-btn"
                    >
                      Browse search results <FiArrowRight />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account and cart */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="user-dropdown">
                <button
                  type="button"
                  className="user-info"
                  aria-label="Open account menu"
                >
                  <span className="nav-action-icon">
                    <FiUser />
                  </span>

                  <span className="user-info-copy">
                    <span className="user-greeting">WELCOME</span>
                    <span className="user-display-name">
                      {user?.name || "My Account"}
                    </span>
                  </span>

                  <FiChevronDown className="user-dropdown-chevron" />
                </button>

                <div className="dropdown-menu">
                  <div className="dropdown-heading">
                    <span className="dropdown-avatar">
                      {(user?.name || "A").charAt(0).toUpperCase()}
                    </span>

                    <span className="dropdown-heading-copy">
                      <strong>{user?.name || "Account"}</strong>
                      <span>Manage your account</span>
                    </span>
                  </div>

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

                  <button type="button" onClick={handleLogout}>
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-login-action">
                <span className="nav-action-icon">
                  <FiUser />
                </span>

                <span className="nav-action-copy">
                  <span className="nav-action-small">WELCOME</span>
                  <strong>Sign in</strong>
                </span>
              </Link>
            )}

            <span className="nav-action-divider" />

            <button
              type="button"
              className="nav-cart-action"
              onClick={handleCartClick}
              aria-label={`Shopping cart, ${cartCount || 0} items`}
            >
              <span className="nav-cart-icon">
                <FiShoppingCart />

                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>

              <span className="nav-cart-copy">
                <span className="nav-action-small">YOUR</span>
                <strong>Cart</strong>
              </span>
            </button>

            <button
              type="button"
              className="menu-btn"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="navbar-navigation"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="navbar-navigation" id="navbar-navigation">
        <div className="navbar-navigation-inner">
          <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>

            <NavLink to="/products" onClick={closeMenu}>
              <FiTag />
              Shop All
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/orders" onClick={closeMenu}>
                <FiPackage />
                My Orders
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={closeMenu}>
                <FiShield />
                Admin Dashboard
              </NavLink>
            )}

            {!isAuthenticated && (
              <NavLink to="/login" onClick={closeMenu}>
                <FiUser />
                Sign In
              </NavLink>
            )}

            {isAuthenticated && (
              <button
                type="button"
                className="mobile-logout-link"
                onClick={handleLogout}
              >
                <FiLogOut />
                Logout
              </button>
            )}
          </nav>

          <Link to="/products" className="navbar-nav-promo" onClick={closeMenu}>
            <span className="navbar-promo-icon">
              <FiTag />
            </span>

            <span>Find your everyday favourites</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
