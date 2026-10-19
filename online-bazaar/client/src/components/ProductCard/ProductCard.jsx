import "./ProductCard.css";

import { useEffect, useState } from "react";
import {
  FiShoppingCart,
  FiHeart,
  FiArrowUpRight,
  FiBell,
  FiCheck,
  FiStar,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function ProductCard({
  id,
  publicId,
  image,
  title,
  category,
  price,
  rating,
  stock,
}) {
  const { user, isAuthenticated, fetchCartCount } = useAuth();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const outOfStock = Number(stock) <= 0;
  const productRating = Number(rating || 0);
  const productUrl = `/products/${publicId}`;

  const formattedPrice = Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    let cancelled = false;

    const checkWishlist = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await fetch(
          `${VITE_API_URL}/api/wishlist/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) return;

        const data = await response.json();
        const wishlistItems = data.wishlist || [];

        const exists = wishlistItems.some(
          (item) => Number(item.product_id || item.id) === Number(id),
        );

        if (!cancelled) setIsWishlisted(exists);
      } catch (error) {
        console.error("Check wishlist error:", error);
      }
    };

    checkWishlist();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isAuthenticated, id]);

  useEffect(() => {
    let cancelled = false;

    const checkReminder = async () => {
      if (!isAuthenticated || !user?.id || Number(stock) > 0) {
        setIsReminderSet(false);
        return;
      }

      try {
        const response = await fetch(
          `${VITE_API_URL}/api/stock-reminders/${user.id}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) setIsReminderSet(data.subscribed);
      } catch (error) {
        console.error("Check stock reminder error:", error);
      }
    };

    checkReminder();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isAuthenticated, id, stock]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to add products to cart.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    try {
      const response = await fetch(`${VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchCartCount(user.id);
      } else {
        toast.error(data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Unable to add product to cart.");
    }
  };

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to add products to wishlist.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        const response = await fetch(
          `${VITE_API_URL}/api/wishlist/${user.id}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        } else {
          toast.error(data.message || "Failed to remove from wishlist.");
        }

        return;
      }

      const response = await fetch(`${VITE_API_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(true);
        toast.success("Added to wishlist ❤️");
      } else if (response.status === 409) {
        setIsWishlisted(true);
        toast.info("Product is already in your wishlist.");
      } else {
        toast.error(data.message || "Failed to add product to wishlist.");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Unable to update wishlist.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReminder = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to get notified.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    if (reminderLoading) return;

    try {
      setReminderLoading(true);

      if (isReminderSet) {
        const response = await fetch(
          `${VITE_API_URL}/api/stock-reminders/${user.id}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setIsReminderSet(false);
          toast.success("Stock reminder cancelled.");
        } else {
          toast.error(data.message || "Unable to cancel reminder.");
        }

        return;
      }

      const response = await fetch(`${VITE_API_URL}/api/stock-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsReminderSet(true);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Unable to set reminder.");
      }
    } catch (error) {
      console.error("Stock reminder error:", error);
      toast.error("Unable to update stock reminder.");
    } finally {
      setReminderLoading(false);
    }
  };

  return (
    <article className="product-card">
      {/* Product image and floating actions */}
      <div className="product-card-visual">
        <Link
          to={productUrl}
          className="product-card-image-link"
          aria-label={`View ${title}`}
        >
          {!imageError && image ? (
            <img
              className="product-card-image"
              src={image}
              alt={title}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="product-card-image-placeholder">
              <span>{title?.charAt(0)?.toUpperCase() || "P"}</span>
              <small>ONLINE BAZAAR</small>
            </div>
          )}
        </Link>

        <div className="product-card-image-top">
          <span
            className={`product-card-badge ${
              outOfStock ? "product-card-badge-out" : ""
            }`}
          >
            {outOfStock ? "Out of stock" : "Everyday essential"}
          </span>

          <button
            type="button"
            className={`product-card-wishlist ${
              isWishlisted ? "is-wishlisted" : ""
            }`}
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart />
          </button>
        </div>

        <Link
          to={productUrl}
          className="product-card-quick-view"
          aria-label={`View ${title} details`}
        >
          <span>Quick view</span>
          <FiArrowUpRight />
        </Link>

        <span className="product-card-image-caption">CURATED FOR EVERYDAY</span>
      </div>

      {/* Product information */}
      <div className="product-card-content">
        <div className="product-card-meta">
          <span className="product-card-category">
            {category || "Home Essentials"}
          </span>

          <span
            className={`product-card-stock ${
              outOfStock ? "product-card-stock-out" : ""
            }`}
          >
            <span className="product-card-stock-dot" />
            {outOfStock ? "Unavailable" : "In stock"}
          </span>
        </div>

        <Link to={productUrl} className="product-card-title">
          {title}
        </Link>

        <div className="product-card-rating">
          <FiStar className="product-card-rating-icon" />
          {productRating > 0 ? (
            <>
              <strong>{productRating.toFixed(1)}</strong>
              <span className="product-card-rating-label">Customer rating</span>
            </>
          ) : (
            <span className="product-card-rating-label">
              Be the first to review
            </span>
          )}
        </div>

        <div className="product-card-divider" />

        {/* Price and primary action */}
        <div className="product-card-purchase">
          <div className="product-card-price-wrap">
            <span className="product-card-price-label">PRICE</span>
            <div className="product-card-price">
              <span className="product-card-currency">₹</span>
              <span>{formattedPrice}</span>
            </div>
          </div>

          {outOfStock ? (
            <button
              type="button"
              className={`product-card-action product-card-remind ${
                isReminderSet ? "is-reminder-set" : ""
              }`}
              onClick={handleReminder}
              disabled={reminderLoading}
            >
              {isReminderSet ? <FiCheck /> : <FiBell />}
              <span>
                {reminderLoading
                  ? "Please wait..."
                  : isReminderSet
                    ? "Reminder set"
                    : "Notify me"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="product-card-action product-card-cart"
              onClick={addToCart}
              aria-label={`Add ${title} to cart`}
              title="Add to cart"
            >
              <FiShoppingCart />
              <span>Add to cart</span>
            </button>
          )}
        </div>

        <Link to={productUrl} className="product-card-details">
          <span>Explore product</span>
          <FiArrowUpRight />
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
