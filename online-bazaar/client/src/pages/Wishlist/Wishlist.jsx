import "./Wishlist.css";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiShoppingBag,
  FiTrash2,
  FiUser,
  FiArrowLeft,
  FiShoppingCart,
  FiPackage,
  FiArrowUpRight,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id;

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${VITE_API_URL}/api/wishlist/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      const data = await response.json();
      setWishlist(data.wishlist || data || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const getProduct = (item) => item.product || item;

  const getProductId = (item) => {
    const product = getProduct(item);
    return product.product_id || product.productId || product.id;
  };

  const removeFromWishlist = async (productId) => {
    try {
      setRemovingId(productId);

      const response = await fetch(
        `${VITE_API_URL}/api/wishlist/${userId}/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove wishlist item");
      }

      setWishlist((prev) =>
        prev.filter((item) => Number(getProductId(item)) !== Number(productId)),
      );

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Remove wishlist error:", error);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (product) => {
    const productId = product.product_id || product.productId || product.id;

    try {
      setAddingCartId(productId);

      const response = await fetch(`${VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      toast.success("Added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Unable to add product to cart");
    } finally {
      setAddingCartId(null);
    }
  };

  const openProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (!user) {
    return (
      <section className="wishlist-page">
        <div className="wishlist-container">
          <button className="wishlist-back" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back
          </button>

          <div className="wishlist-empty wishlist-login-empty">
            <div className="wishlist-empty-icon">
              <FiHeart />
            </div>

            <span className="wishlist-eyebrow">YOUR PERSONAL COLLECTION</span>
            <h1>Keep the things you love close.</h1>

            <p>
              Sign in to save your favourite finds and come back to them
              whenever you like.
            </p>

            <button
              className="wishlist-primary-btn"
              onClick={() => navigate("/login")}
            >
              <FiUser />
              Sign In to Continue
              <FiArrowUpRight />
            </button>

            <div className="wishlist-trust-note">
              <FiShield />
              Your saved collection stays connected to your account.
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-heading">
            <div className="wishlist-heading-left">
              <div className="wishlist-skeleton skeleton-label" />
              <div className="wishlist-skeleton skeleton-title" />
              <div className="wishlist-skeleton skeleton-text" />
            </div>

            <div className="wishlist-skeleton skeleton-count" />
          </div>

          <div className="wishlist-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="wishlist-card wishlist-skeleton-card" key={item}>
                <div className="wishlist-skeleton skeleton-image" />
                <div className="wishlist-product-info">
                  <div className="wishlist-skeleton skeleton-product-name" />
                  <div className="wishlist-skeleton skeleton-price" />
                  <div className="wishlist-skeleton skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-topbar">
          <button className="wishlist-back" onClick={() => navigate(-1)}>
            <FiArrowLeft />
            Back
          </button>

          <span className="wishlist-brand-label">
            <FiShoppingBag />
            ONLINE BAZAAR
          </span>
        </div>

        <div className="wishlist-heading">
          <div className="wishlist-heading-left">
            <span className="wishlist-eyebrow">YOUR PERSONAL COLLECTION</span>

            <h1>
              My Wishlist
              <FiHeart className="wishlist-heading-heart" />
            </h1>

            <p>
              A little place for everything you love. Save your favourites and
              find them again anytime.
            </p>
          </div>

          <div className="wishlist-count">
            <span className="wishlist-count-label">YOUR COLLECTION</span>
            <div className="wishlist-count-number">
              <strong>{String(wishlist.length).padStart(2, "0")}</strong>
              <FiHeart />
            </div>
            <span className="wishlist-count-description">
              {wishlist.length === 1 ? "saved item" : "saved items"}
            </span>
          </div>
        </div>

        <div className="wishlist-divider">
          <span />
          <span>CURATED JUST FOR YOU</span>
          <span />
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <FiHeart />
            </div>

            <span className="wishlist-eyebrow">A FRESH START</span>
            <h2>Your collection is waiting.</h2>

            <p>
              You haven't saved anything just yet.
              <br />
              Explore Online Bazaar and keep the things you love in one place.
            </p>

            <button
              className="wishlist-primary-btn"
              onClick={() => navigate("/products")}
            >
              <FiShoppingBag />
              Explore Products
              <FiArrowUpRight />
            </button>

            <span className="wishlist-empty-footnote">
              Discover something you'll love.
            </span>
          </div>
        ) : (
          <>
            <div className="wishlist-results-bar">
              <p>
                Showing <strong>{wishlist.length}</strong>{" "}
                {wishlist.length === 1 ? "favourite" : "favourites"}
              </p>

              <button
                className="wishlist-continue-link"
                onClick={() => navigate("/products")}
              >
                Continue shopping
                <FiArrowUpRight />
              </button>
            </div>

            <div className="wishlist-grid">
              {wishlist.map((item) => {
                const product = getProduct(item);

                const productId = getProductId(item);

                const image =
                  product.image_url || product.image || product.imageUrl;

                const productName =
                  product.product_name || product.name || "Product";

                const price = Number(product.price || 0);

                return (
                  <article className="wishlist-card" key={productId}>
                    <div
                      className="wishlist-image-wrapper"
                      onClick={() => openProduct(productId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          openProduct(productId);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${productName}`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                          className="wishlist-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="wishlist-no-image">
                          <FiPackage />
                          <span>Image unavailable</span>
                        </div>
                      )}

                      <span className="wishlist-image-label">
                        YOUR FAVOURITE
                      </span>

                      <button
                        className="wishlist-remove"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFromWishlist(productId);
                        }}
                        disabled={removingId === productId}
                        title="Remove from wishlist"
                        aria-label={`Remove ${productName} from wishlist`}
                      >
                        <FiTrash2 />
                      </button>

                      <div className="wishlist-heart-badge">
                        <FiHeart />
                      </div>
                    </div>

                    <div className="wishlist-product-info">
                      <button
                        className="wishlist-product-name"
                        onClick={() => openProduct(productId)}
                      >
                        {productName}
                      </button>

                      <div className="wishlist-product-bottom">
                        <div className="wishlist-price">
                          <span>PRICE</span>
                          <strong>
                            ₹
                            {price.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </div>

                        <span className="wishlist-saved-indicator">
                          <FiCheck />
                          Saved
                        </span>
                      </div>

                      <button
                        className="wishlist-cart-btn"
                        onClick={() => addToCart(product)}
                        disabled={addingCartId === productId}
                      >
                        <FiShoppingCart />
                        {addingCartId === productId
                          ? "Adding..."
                          : "Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="wishlist-footer-note">
          <FiHeart />
          <span>Good things are worth saving.</span>
        </div>
      </div>
    </section>
  );
}

export default Wishlist;
