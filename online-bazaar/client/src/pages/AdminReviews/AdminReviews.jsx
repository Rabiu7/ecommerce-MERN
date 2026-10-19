import "./AdminReviews.css";

import { useCallback, useEffect, useState } from "react";

import {
  FiCheck,
  FiTrash2,
  FiStar,
  FiX,
  FiRefreshCw,
  FiMessageSquare,
  FiShield,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingReviewId, setUpdatingReviewId] = useState(null);
  const [actionError, setActionError] = useState("");

  const [deleteReview, setDeleteReview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // =========================================================
  // FETCH REVIEWS
  // =========================================================

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${VITE_API_URL}/api/reviews`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid reviews response from server.");
      }

      setReviews(data);
    } catch (err) {
      console.error("Fetch reviews error:", err);
      setError("Unable to load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // =========================================================
  // REVIEW SUMMARY
  // =========================================================

  const totalReviews = reviews.length;

  const verifiedReviews = reviews.filter(
    (review) => Number(review.is_verified) === 1,
  ).length;

  const pendingReviews = totalReviews - verifiedReviews;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0,
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // VERIFY / UNVERIFY REVIEW
  // =========================================================

  const handleVerify = async (review) => {
    if (updatingReviewId !== null) return;

    const currentStatus = Number(review.is_verified) === 1;
    const nextStatus = currentStatus ? 0 : 1;

    try {
      setUpdatingReviewId(review.id);
      setActionError("");

      const response = await fetch(
        `${VITE_API_URL}/api/reviews/${review.id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            is_verified: nextStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update review.");
      }

      setReviews((previousReviews) =>
        previousReviews.map((item) =>
          item.id === review.id ? { ...item, is_verified: nextStatus } : item,
        ),
      );
    } catch (err) {
      console.error("Verify review error:", err);
      setActionError(err.message || "Failed to update review.");
    } finally {
      setUpdatingReviewId(null);
    }
  };

  // =========================================================
  // DELETE MODAL
  // =========================================================

  const openDeleteModal = (review) => {
    setActionError("");
    setDeleteReview(review);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteReview(null);
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const handleDelete = async () => {
    if (!deleteReview || deleteLoading) return;

    try {
      setDeleteLoading(true);
      setActionError("");

      const response = await fetch(
        `${VITE_API_URL}/api/reviews/${deleteReview.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete review.");
      }

      setReviews((previousReviews) =>
        previousReviews.filter((item) => item.id !== deleteReview.id),
      );

      setDeleteReview(null);
    } catch (err) {
      console.error("Delete review error:", err);
      setActionError(err.message || "Failed to delete review.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // RENDER STARS
  // =========================================================

  const renderStars = (rating, size = "normal") => {
    const numericRating = Number(rating) || 0;

    return (
      <div
        className={`review-stars ${size === "large" ? "large" : ""}`}
        aria-label={`${numericRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={star <= numericRating ? "star-filled" : ""}
          />
        ))}
      </div>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="admin-reviews-page">
      {/* HEADER */}

      <header className="admin-reviews-header">
        <div className="reviews-heading">
          <span className="admin-reviews-eyebrow">
            ONLINE BAZAAR / MANAGEMENT
          </span>

          <h1>Customer Reviews</h1>

          <p>
            Review customer feedback, verify submissions, and manage product
            reviews.
          </p>
        </div>

        <button
          type="button"
          className="reviews-refresh-btn"
          onClick={fetchReviews}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "refresh-spinning" : ""} />
          <span>{loading ? "Refreshing..." : "Refresh Reviews"}</span>
        </button>
      </header>

      {/* SUMMARY CARDS */}

      <section className="reviews-summary">
        <div className="reviews-summary-card">
          <div className="reviews-summary-top">
            <span className="reviews-summary-label">Total Reviews</span>

            <div className="reviews-summary-icon gold">
              <FiMessageSquare />
            </div>
          </div>

          <strong>{totalReviews}</strong>

          <span className="reviews-summary-note">All customer submissions</span>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-top">
            <span className="reviews-summary-label">Verified</span>

            <div className="reviews-summary-icon green">
              <FiShield />
            </div>
          </div>

          <strong>{verifiedReviews}</strong>

          <span className="reviews-summary-note">
            Approved customer reviews
          </span>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-top">
            <span className="reviews-summary-label">Pending Verification</span>

            <div className="reviews-summary-icon amber">
              <FiClock />
            </div>
          </div>

          <strong>{pendingReviews}</strong>

          <span className="reviews-summary-note">
            Reviews awaiting approval
          </span>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-top">
            <span className="reviews-summary-label">Average Rating</span>

            <div className="reviews-summary-icon gold">
              <FiStar />
            </div>
          </div>

          <strong className="average-rating">
            {averageRating}
            <FiStar className="average-rating-star" />
          </strong>

          <span className="reviews-summary-note">Out of 5 stars</span>
        </div>
      </section>

      {/* ACTION ERROR */}

      {!loading && actionError && !deleteReview && (
        <div className="reviews-action-error">
          <FiAlertCircle />
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* SECTION TITLE */}

      <div className="reviews-section-heading">
        <div>
          <h2>All Reviews</h2>
          <p>Customer feedback and verification status</p>
        </div>

        {!loading && !error && (
          <span className="reviews-total-badge">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        )}
      </div>

      {/* LOADING */}

      {loading && (
        <div className="reviews-state">
          <div className="reviews-spinner" />
          <h3>Loading reviews</h3>
          <p>Please wait while we fetch customer feedback.</p>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="reviews-state reviews-error-state">
          <div className="reviews-state-icon error-icon">
            <FiAlertCircle />
          </div>

          <h3>Unable to load reviews</h3>
          <p>{error}</p>

          <button
            type="button"
            className="reviews-primary-btn"
            onClick={fetchReviews}
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}

      {!loading && !error && reviews.length === 0 && (
        <div className="reviews-state">
          <div className="reviews-state-icon">
            <FiMessageSquare />
          </div>

          <h3>No Reviews Yet</h3>

          <p>
            Customer reviews will appear here when customers start reviewing
            your products.
          </p>
        </div>
      )}

      {/* REVIEW LIST */}

      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => {
            const isVerified = Number(review.is_verified) === 1;
            const isUpdating = updatingReviewId === review.id;

            return (
              <article className="admin-review-card" key={review.id}>
                {/* PRODUCT */}

                <div className="review-product">
                  <div className="review-product-image">
                    {review.product_image ? (
                      <img
                        src={review.product_image}
                        alt={review.product_name || "Product"}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-placeholder">
                        <FiStar />
                      </div>
                    )}
                  </div>

                  <div className="review-product-details">
                    <span className="review-field-label">PRODUCT</span>

                    <h3>{review.product_name || "Unnamed Product"}</h3>

                    <span className="review-product-id">
                      Review #{review.id}
                    </span>
                  </div>
                </div>

                {/* REVIEW CONTENT */}

                <div className="review-content">
                  <div className="review-top">
                    {renderStars(review.rating)}

                    <span
                      className={`review-status ${
                        isVerified ? "verified" : "unverified"
                      }`}
                    >
                      <span className="review-status-dot" />
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <p className="review-comment">
                    {review.comment?.trim() || "No comment provided."}
                  </p>

                  <div className="review-user">
                    <div className="user-avatar">
                      {(review.user_name || "C").trim().charAt(0).toUpperCase()}
                    </div>

                    <div className="review-user-details">
                      <strong>{review.user_name || "Customer"}</strong>

                      <span>{review.user_email || "Email unavailable"}</span>
                    </div>
                  </div>

                  <div className="review-date">
                    <FiClock />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="review-actions">
                  <button
                    type="button"
                    className={`action-btn ${
                      isVerified ? "unverify" : "verify"
                    }`}
                    onClick={() => handleVerify(review)}
                    disabled={updatingReviewId !== null}
                    title={isVerified ? "Mark as unverified" : "Verify review"}
                  >
                    {isUpdating ? (
                      <span className="action-spinner" />
                    ) : isVerified ? (
                      <FiX />
                    ) : (
                      <FiCheck />
                    )}

                    <span>
                      {isUpdating
                        ? "Updating..."
                        : isVerified
                          ? "Unverify"
                          : "Verify Review"}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="action-btn delete"
                    onClick={() => openDeleteModal(review)}
                    disabled={updatingReviewId !== null}
                    title="Delete review"
                  >
                    <FiTrash2 />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}

      {deleteReview && (
        <div
          className="delete-modal-overlay"
          onClick={closeDeleteModal}
          role="presentation"
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              disabled={deleteLoading}
              aria-label="Close delete confirmation"
            >
              <FiX />
            </button>

            <div className="delete-modal-icon">
              <FiTrash2 />
            </div>

            <div className="delete-modal-content">
              <span className="delete-modal-eyebrow">CONFIRM ACTION</span>

              <h2 id="delete-review-title">Delete this review?</h2>

              <p>
                This review from{" "}
                <strong>{deleteReview.user_name || "this customer"}</strong>{" "}
                will be permanently removed. This action cannot be undone.
              </p>

              <div className="delete-modal-review">
                <div className="delete-modal-review-header">
                  <div className="delete-modal-customer">
                    <div className="user-avatar">
                      {(deleteReview.user_name || "C")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>{deleteReview.user_name || "Customer"}</strong>
                      <span>
                        {deleteReview.product_name || "Product review"}
                      </span>
                    </div>
                  </div>

                  {renderStars(deleteReview.rating)}
                </div>

                <p>{deleteReview.comment?.trim() || "No comment provided."}</p>
              </div>

              {actionError && (
                <div className="delete-modal-error">
                  <FiAlertCircle />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="action-spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Delete Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;
