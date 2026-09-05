import "./OrderDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FiArrowLeft, FiPackage, FiStar, FiX, FiCheck } from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // REVIEW STATES
  // ===============================

  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewedProducts, setReviewedProducts] = useState({});

  // ===============================
  // FETCH ORDER
  // ===============================

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/orders/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await response.json();

      console.log("Order Details:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }

      setOrder(data.order);

      // ==========================================
      // CHECK EXISTING REVIEWS
      // ==========================================

      if (data.order?.items) {
        checkExistingReviews(data.order.items);
      }
    } catch (error) {
      console.error("Order Details Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CHECK EXISTING REVIEWS
  // ===============================

  const checkExistingReviews = async (items) => {
    const results = {};

    await Promise.all(
      items.map(async (item) => {
        try {
          const response = await fetch(
            `${VITE_API_URL}/api/reviews/product/${item.product_id}`,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            },
          );

          const data = await response.json();

          results[item.product_id] = data.reviewed;
        } catch (error) {
          console.error(
            `Review check failed for product ${item.product_id}:`,
            error,
          );

          results[item.product_id] = false;
        }
      }),
    );

    setReviewedProducts(results);
  };

  // ===============================
  // OPEN REVIEW MODAL
  // ===============================

  const openReviewModal = (item) => {
    setReviewProduct(item);
    setRating(0);
    setComment("");
  };

  // ===============================
  // CLOSE REVIEW MODAL
  // ===============================

  const closeReviewModal = () => {
    if (submittingReview) return;

    setReviewProduct(null);
    setRating(0);
    setComment("");
  };

  // ===============================
  // SUBMIT REVIEW
  // ===============================

  const submitReview = async () => {
    if (!reviewProduct) return;

    if (rating === 0) {
      alert("Please select a rating.");
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
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      // Mark product as reviewed
      setReviewedProducts((prev) => ({
        ...prev,
        [reviewProduct.product_id]: true,
      }));

      closeReviewModal();

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Submit Review Error:", error);

      alert(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (loading) {
    return (
      <section className="order-loading-page">
        <div className="order-loading-content">
          <div className="order-loading-icon">
            <FiPackage />
          </div>

          <div className="order-loading-spinner"></div>

          <h2>Loading Your Order</h2>

          <p>Please wait while we retrieve your order details.</p>

          <div className="order-loading-line">
            <span></span>
          </div>
        </div>
      </section>
    );
  }

  // ===============================
  // ORDER NOT FOUND
  // ===============================

  if (!order) {
    return (
      <section className="order-details-page">
        <div className="order-details-container">
          <h2>Order Not Found</h2>

          <button onClick={() => navigate("/orders")}>Back to Orders</button>
        </div>
      </section>
    );
  }

  const address = order.shipping_address || {};

  // ===============================
  // DELIVERY STATUS
  // ===============================

  const isDelivered =
    String(order.order_status || "").toLowerCase() === "delivered";

  return (
    <section className="order-details-page">
      <div className="order-details-container">
        {/* BACK BUTTON */}

        <button className="back-btn" onClick={() => navigate("/orders")}>
          <FiArrowLeft />
          Back to Orders
        </button>

        {/* HEADER */}

        <div className="order-details-header">
          <div>
            <span>ORDER DETAILS</span>

            <h1>Order #{order.id}</h1>

            <p>
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="order-status">{order.order_status}</div>
        </div>

        {/* PAYMENT */}

        <div className="order-details-box">
          <h2>Payment Information</h2>

          <div className="details-row">
            <span>Payment Method</span>

            <strong>{order.payment_method}</strong>
          </div>

          <div className="details-row">
            <span>Payment Status</span>

            <strong>{order.payment_status}</strong>
          </div>

          <div className="details-row">
            <span>Order Status</span>

            <strong>{order.order_status}</strong>
          </div>

          <div className="details-row">
            <span>Total</span>

            <strong>₹{Number(order.total_amount || 0).toFixed(2)}</strong>
          </div>
        </div>

        {/* ORDER ITEMS */}

        <div className="order-details-box">
          <h2>
            <FiPackage />
            Ordered Items
          </h2>

          {(order.items || []).map((item) => {
            const alreadyReviewed = reviewedProducts[item.product_id];

            return (
              <div className="detail-product" key={item.id}>
                {/* IMAGE */}

                <div className="detail-product-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name || "Product"} />
                  ) : (
                    <div>No Image</div>
                  )}
                </div>

                {/* PRODUCT INFO */}

                <div className="detail-product-info">
                  <h3>{item.name || "Product"}</h3>

                  <p>Quantity: {item.quantity}</p>

                  <p>Price: ₹{Number(item.price || 0).toFixed(2)}</p>
                </div>

                {/* TOTAL */}

                <div className="detail-product-right">
                  <strong>
                    ₹
                    {(
                      Number(item.price || 0) * Number(item.quantity || 0)
                    ).toFixed(2)}
                  </strong>

                  {/* REVIEW */}

                  {isDelivered && (
                    <>
                      {alreadyReviewed ? (
                        <div className="reviewed-badge">
                          <FiCheck />
                          Reviewed
                        </div>
                      ) : (
                        <button
                          className="write-review-btn"
                          onClick={() => openReviewModal(item)}
                        >
                          <FiStar />
                          Write a Review
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DELIVERY ADDRESS */}

        <div className="order-details-box">
          <h2>Delivery Address</h2>

          <p>
            <strong>{address.fullName || address.name || "Customer"}</strong>
          </p>

          <p>{address.address || ""}</p>

          <p>
            {address.city || ""}

            {address.city && address.state ? ", " : ""}

            {address.state || ""}
          </p>

          <p>PIN: {address.pincode || ""}</p>

          <p>Phone: {address.phone || ""}</p>
        </div>
      </div>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {reviewProduct && (
        <div className="review-modal-overlay" onClick={closeReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}

            <div className="review-modal-header">
              <div>
                <span>SHARE YOUR EXPERIENCE</span>

                <h2>Write a Review</h2>
              </div>

              <button
                className="review-close-btn"
                onClick={closeReviewModal}
                disabled={submittingReview}
              >
                <FiX />
              </button>
            </div>

            {/* PRODUCT */}

            <div className="review-product">
              <div className="review-product-image">
                {reviewProduct.image ? (
                  <img src={reviewProduct.image} alt={reviewProduct.name} />
                ) : (
                  <div>No Image</div>
                )}
              </div>

              <div>
                <h3>{reviewProduct.name}</h3>

                <p>Your feedback helps other customers.</p>
              </div>
            </div>

            {/* RATING */}

            <div className="review-rating-section">
              <label>Your Rating</label>

              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "active" : ""}
                    onClick={() => setRating(star)}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>

              <p className="rating-text">
                {rating === 0 && "Select your rating"}

                {rating === 1 && "Poor"}

                {rating === 2 && "Fair"}

                {rating === 3 && "Good"}

                {rating === 4 && "Very Good"}

                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* COMMENT */}

            <div className="review-comment-section">
              <label htmlFor="review-comment">Your Review</label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience with this product..."
                maxLength={500}
                rows={5}
              />

              <div className="review-character-count">{comment.length}/500</div>
            </div>

            {/* ACTIONS */}

            <div className="review-modal-actions">
              <button
                className="review-cancel-btn"
                onClick={closeReviewModal}
                disabled={submittingReview}
              >
                Cancel
              </button>

              <button
                className="review-submit-btn"
                onClick={submitReview}
                disabled={submittingReview || rating === 0}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrderDetails;
