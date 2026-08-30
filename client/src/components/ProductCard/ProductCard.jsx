import "./ProductCard.css";

import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProductCard({ id, image, title, category, price, rating }) {
  const { user, isAuthenticated, fetchCartCount } = useAuth();

  const navigate = useNavigate();

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
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={title} />

        <button className="wishlist">
          <FiHeart />
        </button>
      </div>

      <div className="product-content">
        <span className="category">{category}</span>

        <h3>{title}</h3>

        <div className="rating">
          <FaStar />
          <span>{rating}</span>
        </div>

        <div className="product-footer">
          <h2>₹{Number(price).toFixed(2)}</h2>

          <button className="cart-button" onClick={addToCart}>
            <FiShoppingCart />
          </button>
        </div>

        <Link to={`/products/${id}`} className="details-button">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
