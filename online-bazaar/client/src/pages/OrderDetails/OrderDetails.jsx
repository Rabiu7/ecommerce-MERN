import "./OrderDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FiArrowLeft,
  FiPackage,
  FiStar,
  FiX,
  FiCheck,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiShoppingBag,
  FiShield,
  FiMessageSquare,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatLabel = (value) => {
  if (!value) return "Not available";

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState({});

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${VITE_API_URL}/api/orders/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch order");
        }

        if (cancelled) return;

        setOrder(data.order || null);

        if (data.order?.items) {
          const results = {};

          await Promise.all(
            data.order.items.map(async (item) => {
              try {
                const reviewResponse = await fetch(
                  `${VITE_API_URL}/api/reviews/product/${encodeURIComponent(
                    item.product_id,
                  )}`,
                  {
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                  },
                );

                const reviewData = await reviewResponse.json();

                results[item.product_id] = reviewResponse.ok
                  ? Boolean(reviewData.reviewed)
                  : false;
              } catch (error) {
                console.error(
                  `Review check failed for product ${item.product_id}:`,
                  error,
                );

                results[item.product_id] = false;
              }
            }),
          );

          if (!cancelled) {
            setReviewedProducts(results);
          }
        }
      } catch (error) {
        console.error("Order Details Error:", error);

        if (!cancelled) {
          setOrder(null);
          toast.error(error.message || "Unable to load order details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadOrder();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const openReviewModal = (item) => {
    setReviewProduct(item);
    setRating(0);
    setComment("");
  };

  const closeReviewModal = () => {
    if (submittingReview) return;

    setReviewProduct(null);
    setRating(0);
    setComment("");
  };

  const submitReview = async () => {
    if (!reviewProduct) return;

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`${VITE_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          product_id: reviewProduct.product_id,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setReviewedProducts((previous) => ({
        ...previous,
        [reviewProduct.product_id]: true,
      }));

      setReviewProduct(null);
      setRating(0);
      setComment("");

      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Submit Review Error:", error);

      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <section className="od-loading-page">
        <div className="od-loading-card">
          <div className="od-loading-icon">
            <FiPackage />
          </div>

          <div className="od-spinner" />

          <span className="od-eyebrow">ONLINE BAZAAR</span>

          <h2>Retrieving Your Order</h2>

          <p>Please wait while we securely retrieve your order information.</p>

          <div className="od-loading-track">
            <span />
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="od-page">
        <div className="od-container">
          <div className="od-empty-state">
            <div className="od-empty-icon">
              <FiAlertCircle />
            </div>

            <span className="od-eyebrow">ONLINE BAZAAR</span>

            <h1>Order Not Found</h1>

            <p>
              We couldn't find this order. It may have been removed, or you may
              not have permission to view it.
            </p>

            <button
              type="button"
              className="od-primary-btn"
              onClick={() => navigate("/orders")}
            >
              <FiArrowLeft />
              Back to My Orders
            </button>
          </div>
        </div>
      </section>
    );
  }

  const address = order.shipping_address || {};
  const items = order.items || [];

  const isDelivered =
    String(order.order_status || "").toLowerCase() === "delivered";

  const orderStatus = String(order.order_status || "processing").toLowerCase();

  const statusClass = orderStatus
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const paymentStatus = String(
    order.payment_status || "not available",
  ).toLowerCase();

  const paymentClass = paymentStatus
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const ratingLabels = {
    0: "Select your rating",
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very good",
    5: "Excellent",
  };

  return (
    <section className="od-page">
      <div className="od-container">
        {/* PAGE NAVIGATION */}

        <div className="od-topbar">
          <button
            type="button"
            className="od-back-btn"
            onClick={() => navigate("/orders")}
          >
            <FiArrowLeft />
            <span>My Orders</span>
          </button>

          <div className="od-breadcrumb">
            <span>Account</span>
            <span className="od-breadcrumb-divider">/</span>
            <span>Orders</span>
            <span className="od-breadcrumb-divider">/</span>
            <strong>Order Details</strong>
          </div>
        </div>

        {/* ORDER INTRODUCTION */}

        <header className="od-header">
          <div className="od-header-copy">
            <span className="od-eyebrow">YOUR ONLINE BAZAAR ORDER</span>

            <h1>Order Details</h1>

            <p>Everything about your purchase, in one place.</p>
          </div>

          <div className={`od-status-pill ${statusClass}`}>
            <span className="od-status-dot" />
            {formatLabel(order.order_status)}
          </div>
        </header>

        {/* ORDER REFERENCE */}

        <div className="od-reference-card">
          <div className="od-reference-icon">
            <FiShoppingBag />
          </div>

          <div className="od-reference-main">
            <span>ORDER NUMBER</span>
            <strong>#{order.public_order_id || order.id || id}</strong>
          </div>

          <div className="od-reference-divider" />

          <div className="od-reference-date">
            <FiCalendar />
            <div>
              <span>ORDER PLACED</span>
              <strong>{formatDate(order.created_at)}</strong>
            </div>
          </div>
        </div>

        {/* ORDER AND PAYMENT INFORMATION */}

        <div className="od-section-grid">
          <section className="od-card od-payment-card">
            <div className="od-card-heading">
              <div className="od-heading-icon">
                <FiCreditCard />
              </div>

              <div>
                <h2>Payment Information</h2>
                <p>Payment method and transaction status</p>
              </div>
            </div>

            <div className="od-info-list">
              <div className="od-info-row">
                <span>Payment Method</span>
                <strong>{formatLabel(order.payment_method)}</strong>
              </div>

              <div className="od-info-row">
                <span>Payment Status</span>
                <span className={`od-payment-pill ${paymentClass}`}>
                  {formatLabel(order.payment_status)}
                </span>
              </div>

              <div className="od-info-row">
                <span>Order Status</span>
                <strong>{formatLabel(order.order_status)}</strong>
              </div>
            </div>

            <div className="od-secure-note">
              <FiShield />
              <span>Your order information is handled securely.</span>
            </div>
          </section>

          <section className="od-card od-total-card">
            <span className="od-eyebrow">ORDER SUMMARY</span>

            <h2>Your Purchase</h2>

            <div className="od-total-line">
              <span>Products</span>
              <strong>
                {items.length} {items.length === 1 ? "item" : "items"}
              </strong>
            </div>

            <div className="od-total-line">
              <span>Total quantity</span>
              <strong>
                {items.reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0,
                )}
              </strong>
            </div>

            <div className="od-total-divider" />

            <div className="od-grand-total">
              <span>Order Total</span>
              <strong>{formatPrice(order.total_amount)}</strong>
            </div>

            <p className="od-total-caption">
              Thank you for shopping with Online Bazaar.
            </p>
          </section>
        </div>

        {/* ORDERED PRODUCTS */}

        <section className="od-card od-items-card">
          <div className="od-card-heading od-items-heading">
            <div className="od-heading-icon">
              <FiPackage />
            </div>

            <div>
              <h2>Items in Your Order</h2>
              <p>
                {items.length} {items.length === 1 ? "product" : "products"}{" "}
                purchased
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="od-no-items">
              <FiPackage />
              <p>No product details are available for this order.</p>
            </div>
          ) : (
            <div className="od-items-list">
              {items.map((item, index) => {
                const alreadyReviewed = reviewedProducts[item.product_id];

                return (
                  <article
                    className="od-product"
                    key={`${item.product_id}-${index}`}
                  >
                    <div className="od-product-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="od-product-no-image">
                          <FiPackage />
                          <span>No image</span>
                        </div>
                      )}
                    </div>

                    <div className="od-product-info">
                      <span className="od-product-label">PRODUCT</span>

                      <h3>{item.name || "Product"}</h3>

                      <div className="od-product-meta">
                        <span>Qty: {Number(item.quantity || 0)}</span>
                        <span className="od-meta-dot">•</span>
                        <span>{formatPrice(item.price)} each</span>
                      </div>

                      {isDelivered && (
                        <div className="od-review-area">
                          {alreadyReviewed ? (
                            <span className="od-reviewed-badge">
                              <FiCheck />
                              Review submitted
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="od-review-btn"
                              onClick={() => openReviewModal(item)}
                            >
                              <FiStar />
                              Write a review
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="od-product-total">
                      <span>ITEM TOTAL</span>
                      <strong>
                        {formatPrice(
                          Number(item.price || 0) * Number(item.quantity || 0),
                        )}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="od-items-footer">
            <span>Total for this order</span>
            <strong>{formatPrice(order.total_amount)}</strong>
          </div>
        </section>

        {/* SHIPPING ADDRESS */}

        <section className="od-card od-address-card">
          <div className="od-card-heading">
            <div className="od-heading-icon">
              <FiMapPin />
            </div>

            <div>
              <h2>Delivery Address</h2>
              <p>Address provided for this order</p>
            </div>
          </div>

          <div className="od-address-content">
            <div className="od-address-person-icon">
              <FiMapPin />
            </div>

            <div className="od-address-details">
              <h3>{address.fullName || address.name || "Customer"}</h3>

              {address.address && <p>{address.address}</p>}

              {(address.city || address.state) && (
                <p>
                  {address.city || ""}
                  {address.city && address.state ? ", " : ""}
                  {address.state || ""}
                </p>
              )}

              {address.pincode && (
                <p className="od-address-muted">PIN: {address.pincode}</p>
              )}

              {address.phone && (
                <p className="od-address-muted">Phone: {address.phone}</p>
              )}
            </div>
          </div>
        </section>

        {/* BOTTOM ACTIONS */}

        <div className="od-bottom-actions">
          <div className="od-help-message">
            <FiMessageSquare />
            <span>Need help with your order? Contact our support team.</span>
          </div>

          <div className="od-action-buttons">
            <button
              type="button"
              className="od-secondary-btn"
              onClick={() => navigate("/orders")}
            >
              <FiArrowLeft />
              My Orders
            </button>

            <button
              type="button"
              className="od-primary-btn"
              onClick={() => navigate("/products")}
            >
              <FiShoppingBag />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}

      {reviewProduct && (
        <div
          className="od-modal-overlay"
          onClick={closeReviewModal}
          role="presentation"
        >
          <div
            className="od-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="od-review-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="od-modal-header">
              <div>
                <span className="od-eyebrow">SHARE YOUR EXPERIENCE</span>
                <h2 id="od-review-title">Write a Review</h2>
                <p>Your opinion helps other shoppers.</p>
              </div>

              <button
                type="button"
                className="od-modal-close"
                onClick={closeReviewModal}
                disabled={submittingReview}
                aria-label="Close review dialog"
              >
                <FiX />
              </button>
            </div>

            <div className="od-modal-product">
              <div className="od-modal-product-image">
                {reviewProduct.image ? (
                  <img
                    src={reviewProduct.image}
                    alt={reviewProduct.name || "Product"}
                  />
                ) : (
                  <FiPackage />
                )}
              </div>

              <div>
                <span className="od-product-label">REVIEWING</span>
                <h3>{reviewProduct.name || "Product"}</h3>
                <p>Share your honest feedback about this product.</p>
              </div>
            </div>

            <div className="od-rating-section">
              <label>Your Rating</label>

              <div
                className="od-stars"
                role="group"
                aria-label="Choose a rating from one to five stars"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "active" : ""}
                    onClick={() => setRating(star)}
                    aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                    aria-pressed={rating === star}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>

              <p className="od-rating-label">{ratingLabels[rating]}</p>
            </div>

            <div className="od-comment-section">
              <label htmlFor="od-review-comment">Your Review</label>

              <textarea
                id="od-review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What did you like about this product? Tell us about your experience..."
                maxLength={500}
                rows={5}
              />

              <div className="od-character-count">{comment.length}/500</div>
            </div>

            <div className="od-modal-actions">
              <button
                type="button"
                className="od-secondary-btn"
                onClick={closeReviewModal}
                disabled={submittingReview}
              >
                Cancel
              </button>

              <button
                type="button"
                className="od-primary-btn"
                onClick={submitReview}
                disabled={submittingReview || rating === 0}
              >
                {submittingReview ? (
                  <>
                    <FiRefreshCw className="od-button-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiStar />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderDetails;
