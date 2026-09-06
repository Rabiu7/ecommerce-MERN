import "./Wishlist.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiHeart,
  FiShoppingBag,
  FiTrash2,
  FiArrowLeft,
  FiShoppingCart,
  FiPackage,
} from "react-icons/fi";

import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchWishlist();
  }, [user?.id]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${VITE_API_URL}/api/wishlist/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      const data = await response.json();

      console.log("Wishlist API Response:", data);

      setWishlist(data.wishlist || data || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setRemovingId(productId);

      const response = await fetch(
        `${VITE_API_URL}/api/wishlist/${user.id}/${productId}`,
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
        prev.filter(
          (item) => Number(item.product_id || item.id) !== Number(productId),
        ),
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
    try {
      const productId = product.product_id || product.id;

      const response = await fetch(`${VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.id,
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
    }
  };

  const getProduct = (item) => {
    return item.product || item;
  };

  if (!user) {
    return (
      <section className="wishlist-page">
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <FiHeart />
          </div>

          <h1>Please login to view your wishlist</h1>

          <p>Sign in to save your favorite products and access them anytime.</p>

          <button
            className="wishlist-primary-btn"
            onClick={() => navigate("/login")}
          >
            <FiUser />
            Login
          </button>
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
              <div className="wishlist-skeleton skeleton-label"></div>
              <div className="wishlist-skeleton skeleton-title"></div>
              <div className="wishlist-skeleton skeleton-text"></div>
            </div>

            <div className="wishlist-skeleton skeleton-count"></div>
          </div>

          <div className="wishlist-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="wishlist-card wishlist-skeleton-card" key={item}>
                <div className="wishlist-skeleton skeleton-image"></div>

                <div className="wishlist-product-info">
                  <div className="wishlist-skeleton skeleton-product-name"></div>
                  <div className="wishlist-skeleton skeleton-price"></div>
                  <div className="wishlist-skeleton skeleton-button"></div>
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
        {/* HEADER */}

        <div className="wishlist-heading">
          <div className="wishlist-heading-left">
            <button className="wishlist-back" onClick={() => navigate(-1)}>
              <FiArrowLeft />
              Back
            </button>

            <span>MY COLLECTION</span>

            <h1>
              My Wishlist
              <FiHeart className="wishlist-heading-heart" />
            </h1>

            <p>Your favorite products, saved in one place.</p>
          </div>

          {wishlist.length > 0 && (
            <div className="wishlist-count">
              <strong>{wishlist.length}</strong>
              <span>
                {wishlist.length === 1 ? "Saved Item" : "Saved Items"}
              </span>
            </div>
          )}
        </div>

        {/* EMPTY */}

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <FiHeart />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              You haven't saved any products yet.
              <br />
              Explore our collection and save your favorites.
            </p>

            <button
              className="wishlist-primary-btn"
              onClick={() => navigate("/products")}
            >
              <FiShoppingBag />
              Explore Products
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const product = getProduct(item);

              const productId =
                product.product_id || product.productId || product.id;

              const image =
                product.image_url || product.image || product.imageUrl;

              const productName =
                product.product_name || product.name || "Product";

              const price = Number(product.price || 0);

              return (
                <div className="wishlist-card" key={productId}>
                  {/* IMAGE */}

                  <div
                    className="wishlist-image-wrapper"
                    onClick={() => navigate(`/products/${productId}`)}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={productName}
                        className="wishlist-image"
                      />
                    ) : (
                      <div className="wishlist-no-image">
                        <FiPackage />
                      </div>
                    )}

                    <button
                      className="wishlist-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(productId);
                      }}
                      disabled={removingId === productId}
                      title="Remove from wishlist"
                    >
                      <FiTrash2 />
                    </button>

                    <div className="wishlist-heart-badge">
                      <FiHeart />
                    </div>
                  </div>

                  {/* INFO */}

                  <div className="wishlist-product-info">
                    <h3 onClick={() => navigate(`/products/${productId}`)}>
                      {productName}
                    </h3>

                    <div className="wishlist-price">₹{price.toFixed(2)}</div>

                    <button
                      className="wishlist-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      <FiShoppingCart />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;
