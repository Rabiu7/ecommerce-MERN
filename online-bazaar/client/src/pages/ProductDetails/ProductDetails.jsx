import "./ProductDetails.css";

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiShoppingCart,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import ProductCard from "../../components/ProductCard/ProductCard";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const SITE_URL = "https://onlinebazaar.in";
const STORE_NAME = "Online Bazaar";

function ProductDetails() {
  const { publicId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedPagination, setRelatedPagination] = useState(null);
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const outOfStock = product ? Number(product.stock) <= 0 : false;
  const price = Number(product?.price || 0);
  const maxQuantity = Math.max(0, Number(product?.stock || 0));
  const productUrl = `${SITE_URL}/products/${publicId}`;

  useEffect(() => {
    if (!product || !publicId) return;

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || "",
      image: product.image ? [product.image] : [],
      url: productUrl,
      brand: {
        "@type": "Brand",
        name: STORE_NAME,
      },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: price.toFixed(2),
        availability: outOfStock
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: STORE_NAME,
        },
      },
    };

    document.getElementById("product-schema")?.remove();

    const script = document.createElement("script");
    script.id = "product-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(productSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById("product-schema")?.remove();
    };
  }, [product, publicId, productUrl, price, outOfStock]);

  useEffect(() => {
    if (!product || !publicId) return;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: `${SITE_URL}/products`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: productUrl,
        },
      ],
    };

    document.getElementById("breadcrumb-schema")?.remove();

    const script = document.createElement("script");
    script.id = "breadcrumb-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById("breadcrumb-schema")?.remove();
    };
  }, [product, publicId, productUrl]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setProduct(null);
      setQuantity(1);

      const response = await fetch(`${VITE_API_URL}/api/products/${publicId}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
      setProduct(null);
      toast.error("Unable to load product");
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  const fetchRelatedProducts = useCallback(async () => {
    try {
      setRelatedLoading(true);

      const response = await fetch(
        `${VITE_API_URL}/api/products/${publicId}/related?page=${relatedPage}&limit=4`,
      );

      if (!response.ok) {
        throw new Error("Unable to load related products");
      }

      const data = await response.json();
      setRelatedProducts(data.products || []);
      setRelatedPagination(data.pagination || null);
    } catch (error) {
      console.error("Error loading related products:", error);
      setRelatedProducts([]);
      setRelatedPagination(null);
    } finally {
      setRelatedLoading(false);
    }
  }, [publicId, relatedPage]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (publicId) fetchRelatedProducts();
  }, [fetchRelatedProducts, publicId]);

  useEffect(() => {
    setRelatedPage(1);
  }, [publicId]);

  useEffect(() => {
    let cancelled = false;

    const checkReminder = async () => {
      if (
        !isAuthenticated ||
        !user?.id ||
        !product?.id ||
        Number(product.stock) > 0
      ) {
        setIsReminderSet(false);
        return;
      }

      try {
        const response = await fetch(
          `${VITE_API_URL}/api/stock-reminders/${user.id}/${product.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) setIsReminderSet(Boolean(data.subscribed));
      } catch (error) {
        console.error("Check stock reminder error:", error);
      }
    };

    checkReminder();

    return () => {
      cancelled = true;
    };
  }, [user?.id, isAuthenticated, product?.id, product?.stock]);

  const requireLogin = (message) => {
    toast.info(message);
    setTimeout(() => navigate("/login"), 1000);
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      requireLogin("Please login to add products to your cart.");
      return;
    }

    if (!product || outOfStock || cartLoading) return;

    try {
      setCartLoading(true);

      const response = await fetch(`${VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Product added to cart!");
      } else {
        toast.error(data.message || "Unable to add product");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong while adding to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const buyNow = () => {
    if (!isAuthenticated) {
      requireLogin("Please login to continue.");
      return;
    }

    if (!product || outOfStock) {
      toast.error("Product is out of stock.");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNow: true,
        cartItems: [
          {
            product_id: product.id,
            name: product.name,
            image: product.image,
            price,
            quantity,
            stock: product.stock,
          },
        ],
      },
    });
  };

  const handleRemindMe = async () => {
    if (!isAuthenticated) {
      requireLogin("Please login to get stock notifications.");
      return;
    }

    if (reminderLoading || !product) return;

    try {
      setReminderLoading(true);

      const url = isReminderSet
        ? `${VITE_API_URL}/api/stock-reminders/${user.id}/${product.id}`
        : `${VITE_API_URL}/api/stock-reminders`;

      const response = await fetch(url, {
        method: isReminderSet ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        ...(!isReminderSet && {
          body: JSON.stringify({
            user_id: user.id,
            product_id: product.id,
          }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsReminderSet(!isReminderSet);
        toast.success(
          data.message ||
            (isReminderSet
              ? "Stock reminder cancelled."
              : "Stock reminder activated."),
        );
      } else {
        toast.error(data.message || "Unable to update stock reminder.");
      }
    } catch (error) {
      console.error("Stock reminder error:", error);
      toast.error("Unable to update stock reminder.");
    } finally {
      setReminderLoading(false);
    }
  };

  const previousRelatedPage = () => {
    if (relatedPagination?.hasPreviousPage && !relatedLoading) {
      setRelatedPage((current) => current - 1);
    }
  };

  const nextRelatedPage = () => {
    if (relatedPagination?.hasNextPage && !relatedLoading) {
      setRelatedPage((current) => current + 1);
    }
  };

  const formattedPrice = price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (loading) {
    return (
      <section className="product-details-state">
        <span className="product-details-spinner" />
        <h2>Finding your product...</h2>
        <p>Please wait while we load the details.</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-details-state">
        <div className="product-details-state-icon">
          <FiShoppingBag />
        </div>
        <h2>Product not found</h2>
        <p>This product may have been removed or the link may be incorrect.</p>
        <Link to="/products" className="pd-primary-button">
          <FiArrowLeft /> Browse products
        </Link>
      </section>
    );
  }

  return (
    <main className="product-details-page">
      <div className="pd-container">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight />
          <Link to="/products">Shop</Link>
          <FiChevronRight />
          <span>{product.name}</span>
        </nav>

        <section className="pd-product-layout">
          <div className="pd-gallery">
            <div className="pd-gallery-heading">
              <span className="pd-gallery-kicker">ONLINE BAZAAR</span>
              <span className="pd-gallery-number">01 / PRODUCT</span>
            </div>

            <div className="pd-image-frame">
              <div className="pd-image-decoration pd-decoration-one" />
              <div className="pd-image-decoration pd-decoration-two" />

              {product.image ? (
                <img
                  className="pd-product-image"
                  src={product.image}
                  alt={product.name}
                />
              ) : (
                <div className="pd-image-placeholder">
                  <FiShoppingBag />
                  <span>Product image unavailable</span>
                </div>
              )}

              <span
                className={`pd-stock-badge ${outOfStock ? "is-out" : "is-in"}`}
              >
                <span />
                {outOfStock ? "Out of stock" : "In stock"}
              </span>

              <span className="pd-image-watermark">OB.</span>
            </div>

            <div className="pd-gallery-caption">
              <div>
                <span className="pd-caption-label">SELECTED FOR YOU</span>
                <p>Everyday essentials, thoughtfully selected.</p>
              </div>
              <span className="pd-caption-symbol">✳</span>
            </div>
          </div>

          <div className="pd-product-summary">
            <div className="pd-summary-topline">
              <span className="pd-category-label">
                <span className="pd-category-dot" />
                {product.category || "Everyday essentials"}
              </span>
              <span className="pd-product-reference">PRODUCT DETAILS</span>
            </div>

            <h1 className="pd-product-title">{product.name}</h1>

            <div className="pd-rating-row">
              <span className="pd-rating-stars">
                <FaStar />
              </span>
              <strong>{Number(product.rating || 0).toFixed(1)}</strong>
              <span className="pd-rating-caption">Product rating</span>
            </div>

            <div className="pd-price-panel">
              <div className="pd-price-line">
                <span className="pd-price">₹{formattedPrice}</span>
                <span className="pd-price-tag">OUR PRICE</span>
              </div>
              <p>Price shown in Indian Rupees (INR).</p>
            </div>

            <div className="pd-description-block">
              <h2>Product overview</h2>
              <p>
                {product.description ||
                  "A thoughtfully selected everyday essential. Explore the details and make it part of your collection."}
              </p>
            </div>

            <div className="pd-availability">
              {outOfStock ? (
                <div className="pd-out-stock-card">
                  <span className="pd-availability-icon out">
                    <FiBell />
                  </span>
                  <div className="pd-availability-copy">
                    <strong>Currently unavailable</strong>
                    <span>Get notified when this item is back in stock.</span>
                  </div>
                  <button
                    type="button"
                    className={`pd-reminder-button ${
                      isReminderSet ? "is-subscribed" : ""
                    }`}
                    onClick={handleRemindMe}
                    disabled={reminderLoading}
                  >
                    {reminderLoading ? (
                      "Please wait..."
                    ) : isReminderSet ? (
                      <>
                        <FiCheck /> Subscribed
                      </>
                    ) : (
                      <>
                        <FiBell /> Remind me
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="pd-in-stock-row">
                  <span className="pd-in-stock-icon">
                    <FiCheck />
                  </span>
                  <div>
                    <strong>Ready to be yours</strong>
                    <span>{product.stock} items available</span>
                  </div>
                  <span className="pd-availability-status">AVAILABLE</span>
                </div>
              )}
            </div>

            {!outOfStock && (
              <div className="pd-purchase-panel">
                <div className="pd-purchase-heading">
                  <h2>Make it yours</h2>
                  <span>Choose your quantity</span>
                </div>

                <div className="pd-purchase-row">
                  <div className="pd-quantity-control">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                      disabled={quantity <= 1}
                    >
                      <FiMinus />
                    </button>

                    <span aria-live="polite">{quantity}</span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(maxQuantity, current + 1),
                        )
                      }
                      disabled={quantity >= maxQuantity}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="pd-subtotal">
                    <span>Subtotal</span>
                    <strong>
                      ₹
                      {(price * quantity).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                </div>

                <div className="pd-action-buttons">
                  <button
                    type="button"
                    className="pd-cart-button"
                    onClick={addToCart}
                    disabled={cartLoading}
                  >
                    <FiShoppingCart />
                    {cartLoading ? "Adding to cart..." : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    className="pd-buy-button"
                    onClick={buyNow}
                  >
                    Buy Now <FiArrowRight />
                  </button>
                </div>

                <p className="pd-purchase-note">
                  <FiShield /> Secure checkout for your order
                </p>
              </div>
            )}

            <div className="pd-trust-row">
              <div className="pd-trust-item">
                <span className="pd-trust-icon">
                  <FiShield />
                </span>
                <div>
                  <strong>Secure shopping</strong>
                  <small>Protected checkout</small>
                </div>
              </div>

              <div className="pd-trust-item">
                <span className="pd-trust-icon">
                  <FiTruck />
                </span>
                <div>
                  <strong>Delivery details</strong>
                  <small>Available at checkout</small>
                </div>
              </div>
            </div>

            <Link to="/products" className="pd-back-link">
              <FiArrowLeft /> Continue browsing
            </Link>
          </div>
        </section>

        <section className="pd-details-strip">
          <div className="pd-details-strip-heading">
            <span>THE DETAILS</span>
            <span className="pd-details-strip-mark">OB / 01</span>
          </div>
          <div className="pd-details-strip-content">
            <div>
              <span className="pd-detail-index">01</span>
              <h2>About this product</h2>
            </div>
            <p>
              {product.description ||
                "A thoughtfully selected everyday essential. Explore the details and make it part of your collection."}
            </p>
          </div>
          <div className="pd-details-strip-footer">
            <span>
              <FiCheck /> Carefully selected
            </span>
            <span>
              <FiShield /> Secure shopping
            </span>
            <span>
              <FiTruck /> Delivery at checkout
            </span>
          </div>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="pd-related-section">
          <div className="pd-container">
            <div className="pd-related-heading">
              <div>
                <span className="pd-related-eyebrow">KEEP EXPLORING</span>
                <h2>
                  More to discover<span>.</span>
                </h2>
                <p>Find something else you will love.</p>
              </div>

              <Link to="/products" className="pd-related-link">
                Explore all products <FiArrowRight />
              </Link>
            </div>

            {relatedLoading ? (
              <div className="pd-related-loading">
                <span className="product-details-spinner" />
                <span>Finding more for you...</span>
              </div>
            ) : (
              <div className="pd-related-grid">
                {relatedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    publicId={item.public_id}
                    image={item.image}
                    title={item.name}
                    category={item.category}
                    price={item.price}
                    rating={item.rating}
                    stock={item.stock}
                  />
                ))}
              </div>
            )}

            {relatedPagination && relatedPagination.totalPages > 1 && (
              <nav
                className="pd-related-pagination"
                aria-label="Related products pages"
              >
                <button
                  type="button"
                  onClick={previousRelatedPage}
                  disabled={
                    !relatedPagination.hasPreviousPage || relatedLoading
                  }
                >
                  <FiArrowLeft /> Previous
                </button>

                <span>
                  Page <strong>{relatedPagination.currentPage}</strong> of{" "}
                  {relatedPagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={nextRelatedPage}
                  disabled={!relatedPagination.hasNextPage || relatedLoading}
                >
                  Next <FiArrowRight />
                </button>
              </nav>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetails;
