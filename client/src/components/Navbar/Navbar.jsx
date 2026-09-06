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

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { toast } from "react-toastify";

import "./Navbar.css";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // SEARCH STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const searchRef = useRef(null);

  const { user, isAuthenticated, logout, cartCount } = useAuth();

  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // =========================================================
  // FETCH PRODUCTS FROM DATABASE
  // =========================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await fetch(`${VITE_API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        // Supports both:
        // [products]
        // { products: [...] }
        const productList = Array.isArray(data) ? data : data.products || [];

        setProducts(productList);
      } catch (error) {
        console.error("Navbar product search error:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================================================
  // SEARCH PRODUCTS
  // =========================================================

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      setSearchResults([]);
      return;
    }

    const results = products
      .filter((product) => {
        const name = String(product.name || "").toLowerCase();

        const category = String(
          product.category_name || product.category || "",
        ).toLowerCase();

        return name.includes(term) || category.includes(term);
      })
      .slice(0, 6);

    setSearchResults(results);
  }, [searchTerm, products]);

  // =========================================================
  // CLOSE SEARCH WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // SEARCH SUBMIT
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    const term = searchTerm.trim();

    if (!term) {
      return;
    }

    setShowSuggestions(false);

    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  // =========================================================
  // CLICK PRODUCT SUGGESTION
  // =========================================================

  const handleProductClick = (product) => {
    setSearchTerm("");
    setShowSuggestions(false);

    navigate(`/products/${product.id}`);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  // =========================================================
  // CART
  // =========================================================

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to access your cart");
      return;
    }

    navigate("/cart");
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

          <Link
            to={isAuthenticated ? "/cart" : "#"}
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                toast.error("Please login to access your cart");
                return;
              }

              closeMenu();
            }}
          >
            Cart
          </Link>

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

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="search-container" ref={searchRef}>
          <form className="search-box" onSubmit={handleSearch}>
            <FiSearch />

            <input
              type="text"
              value={searchTerm}
              placeholder="Search products..."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setShowSuggestions(true);
              }}
            />
          </form>

          {/* SEARCH SUGGESTIONS */}

          {showSuggestions && searchTerm.trim() !== "" && (
            <div className="search-suggestions">
              {productsLoading ? (
                <div className="search-message">Searching products...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="search-heading">Products</div>

                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="search-result"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="search-result-image">
                        <img
                          src={product.image || "/placeholder-product.png"}
                          alt={product.name}
                        />
                      </div>

                      <div className="search-result-info">
                        <span className="search-result-name">
                          {product.name}
                        </span>

                        {product.category_name && (
                          <span className="search-result-category">
                            {product.category_name}
                          </span>
                        )}

                        {product.price !== undefined && (
                          <span className="search-result-price">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    className="search-view-all"
                    onClick={handleSearch}
                  >
                    View all results for "{searchTerm}"
                  </button>
                </>
              ) : (
                <div className="search-message">
                  No products found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT ICONS */}

        <div className="nav-icons">
          {/* CART */}

          <button
            type="button"
            className="icon cart-icon"
            onClick={handleCartClick}
          >
            <FiShoppingCart />

            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

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
