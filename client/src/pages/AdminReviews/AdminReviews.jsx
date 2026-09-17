import "./AdminReviews.css";

import { useEffect, useState } from "react";
import { FiCheck, FiTrash2, FiStar, FiX } from "react-icons/fi";

const VITE_API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.2.122:5000";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // DELETE MODAL
  // =========================================================

  const [deleteReview, setDeleteReview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // =========================================================
  // FETCH REVIEWS
  // =========================================================

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${VITE_API_URL}/api/reviews`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      setReviews(data);
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchReviews();
  }, []);

  // =========================================================
  // VERIFY / UNVERIFY REVIEW
  // =========================================================

  const handleVerify = async (id, currentStatus) => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/reviews/${id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          is_verified: currentStatus ? 0 : 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update review");
      }

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === id
            ? {
                ...review,
                is_verified: currentStatus ? 0 : 1,
              }
            : review
        )
      );
    } catch (error) {
      console.error("Verify review error:", error);

      alert(error.message || "Failed to update review.");
    }
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const openDeleteModal = (review) => {
    setDeleteReview(review);
  };

  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteReview(null);
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const handleDelete = async () => {
    if (!deleteReview) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(
        `${VITE_API_URL}/api/reviews/${deleteReview.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete review");
      }

      // Remove deleted review from the screen
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== deleteReview.id)
      );

      // Close confirmation modal
      setDeleteReview(null);
    } catch (error) {
      console.error("Delete review error:", error);

      alert(error.message || "Failed to delete review.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // RENDER STARS
  // =========================================================

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={star <= Number(rating) ? "star-filled" : ""}
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
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-reviews-header">
        <div>
          <span className="admin-reviews-eyebrow">CUSTOMER FEEDBACK</span>

          <h1>Reviews</h1>

          <p>Manage customer feedback and product reviews.</p>
        </div>

        <div className="reviews-count">
          <span>{reviews.length}</span>

          <small>Total Reviews</small>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div className="reviews-state">
          <div className="reviews-spinner"></div>

          <p>Loading reviews...</p>
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <div className="reviews-state error">
          <p>{error}</p>

          <button onClick={fetchReviews}>Try Again</button>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading && !error && reviews.length === 0 && (
        <div className="reviews-state">
          <div className="empty-icon">
            <FiStar />
          </div>

          <h2>No Reviews Yet</h2>

          <p>
            Customer reviews will appear here when customers start reviewing
            your products.
          </p>
        </div>
      )}

      {/* =====================================================
          REVIEWS
      ===================================================== */}

      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div className="admin-review-card" key={review.id}>
              {/* =================================================
                    PRODUCT
                ================================================= */}

              <div className="review-product">
                {review.product_image ? (
                  <img src={review.product_image} alt={review.product_name} />
                ) : (
                  <div className="product-placeholder">
                    <FiStar />
                  </div>
                )}

                <div>
                  <span>PRODUCT</span>

                  <h3>{review.product_name}</h3>
                </div>
              </div>

              {/* =================================================
                    REVIEW CONTENT
                ================================================= */}

              <div className="review-content">
                <div className="review-top">
                  <div>{renderStars(review.rating)}</div>

                  <span
                    className={
                      review.is_verified
                        ? "review-status verified"
                        : "review-status unverified"
                    }
                  >
                    {review.is_verified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <p className="review-comment">
                  {review.comment || "No comment provided."}
                </p>

                {/* USER */}

                <div className="review-user">
                  <div className="user-avatar">
                    {review.user_name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <strong>{review.user_name}</strong>

                    <span>{review.user_email}</span>
                  </div>
                </div>

                {/* DATE */}

                <div className="review-date">
                  {new Date(review.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* =================================================
                    ACTIONS
                ================================================= */}

              <div className="review-actions">
                <button
                  type="button"
                  className={
                    review.is_verified
                      ? "action-btn unverify"
                      : "action-btn verify"
                  }
                  onClick={() => handleVerify(review.id, review.is_verified)}
                  title={
                    review.is_verified ? "Mark as unverified" : "Verify review"
                  }
                >
                  <FiCheck />

                  {review.is_verified ? "Unverify" : "Verify"}
                </button>

                <button
                  type="button"
                  className="action-btn delete"
                  onClick={() => openDeleteModal(review)}
                  title="Delete review"
                >
                  <FiTrash2 />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteReview && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* CLOSE */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              disabled={deleteLoading}
            >
              <FiX />
            </button>

            {/* ICON */}

            <div className="delete-modal-icon">
              <FiTrash2 />
            </div>

            {/* CONTENT */}

            <div className="delete-modal-content">
              <h2>Delete Review?</h2>

              <p>
                This review from <strong>{deleteReview.user_name}</strong> will
                be permanently removed.
              </p>

              <div className="delete-modal-review">
                <div className="delete-modal-stars">
                  {renderStars(deleteReview.rating)}
                </div>

                <p>{deleteReview.comment || "No comment provided."}</p>
              </div>
            </div>

            {/* ACTIONS */}

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
                  "Deleting..."
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
