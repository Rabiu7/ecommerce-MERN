import "./ProductCard.css";

import { useEffect, useState } from "react";

import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProductCard({ id, image, title, category, price, rating, stock }) {
  const { user, isAuthenticated, fetchCartCount } = useAuth();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [isReminderSet, setIsReminderSet] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  /*
   * CHECK WHETHER PRODUCT IS ALREADY IN WISHLIST
   */
  useEffect(() => {
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

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const wishlistItems = data.wishlist || [];

        const exists = wishlistItems.some(
          (item) => Number(item.product_id || item.id) === Number(id),
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.error("Check wishlist error:", error);
      }
    };

    checkWishlist();
  }, [user?.id, isAuthenticated, id]);

  /*
   * CHECK WHETHER PRODUCT IS ALREADY IN STOCK REMINDER
   */
  useEffect(() => {
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

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setIsReminderSet(data.subscribed);
      } catch (error) {
        console.error("Check stock reminder error:", error);
      }
    };

    checkReminder();
  }, [user?.id, isAuthenticated, id, stock]);

  /*
   * ADD TO CART
   */
  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to add products to cart.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

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

  /*
   * TOGGLE WISHLIST
   */
  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to add products to wishlist.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      /*
       * REMOVE FROM WISHLIST
       */
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

      /*
       * ADD TO WISHLIST
       */
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

  const productRating = Number(rating || 0);

  const handleReminder = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to get notified.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    if (reminderLoading) return;

    try {
      setReminderLoading(true);

      // ============================================
      // CANCEL REMINDER
      // ============================================

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

      // ============================================
      // ADD REMINDER
      // ============================================

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
      {/* IMAGE */}
      <div className="product-card-image">
        <Link to={`/products/${id}`}>
          <img src={image} alt={title} loading="lazy" />
        </Link>

        {Number(stock) <= 0 && (
          <span className="product-card-out-stock">Out of Stock</span>
        )}

        <button
          type="button"
          className={`product-wishlist ${isWishlisted ? "wishlisted" : ""}`}
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart />
        </button>
      </div>

      {/* CONTENT */}
      <div className="product-card-body">
        {/* CATEGORY */}
        <div className="product-card-category">
          {category || "Home Essentials"}
        </div>

        {/* TITLE */}
        <Link to={`/products/${id}`} className="product-card-title">
          {title}
        </Link>

        {/* RATING */}
        <div className="product-card-rating">
          <FaStar />

          <span>{productRating > 0 ? productRating.toFixed(1) : "New"}</span>
        </div>

        {/* PRICE + CART */}
        {/* PRICE + CART */}
        <div className="product-card-footer">
          <div className="product-card-price">
            ₹{Number(price || 0).toFixed(2)}
          </div>

          {Number(stock) > 0 ? (
            <button
              type="button"
              className="product-card-cart"
              onClick={addToCart}
              aria-label="Add to cart"
            >
              <FiShoppingCart />
            </button>
          ) : (
            <button
              type="button"
              className={`product-card-remind ${
                isReminderSet ? "reminder-set" : ""
              }`}
              onClick={handleReminder}
              disabled={reminderLoading}
            >
              {reminderLoading
                ? "Please wait..."
                : isReminderSet
                  ? "✓ You're on the list"
                  : "Remind Me"}
            </button>
          )}
        </div>

        {/* DETAILS */}
        <Link to={`/products/${id}`} className="product-card-details">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
