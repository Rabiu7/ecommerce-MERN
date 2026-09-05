import "./AdminReviews.css";

import { useEffect, useState } from "react";
import { FiCheck, FiTrash2, FiStar } from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleVerify = async (id, currentStatus) => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/reviews/${id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_verified: currentStatus ? 0 : 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === id
            ? {
                ...review,
                is_verified: currentStatus ? 0 : 1,
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Verify review error:", error);
      alert("Failed to update review.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${VITE_API_URL}/api/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== id),
      );
    } catch (error) {
      console.error("Delete review error:", error);
      alert("Failed to delete review.");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar key={star} className={star <= rating ? "star-filled" : ""} />
        ))}
      </div>
    );
  };

  return (
    <div className="admin-reviews-page">
      {/* Header */}
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

      {/* Loading */}
      {loading && (
        <div className="reviews-state">
          <div className="reviews-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="reviews-state error">
          <p>{error}</p>

          <button onClick={fetchReviews}>Try Again</button>
        </div>
      )}

      {/* Empty */}
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

      {/* Reviews */}
      {!loading && !error && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div className="admin-review-card" key={review.id}>
              {/* Product */}
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

              {/* Review Content */}
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

                <div className="review-user">
                  <div className="user-avatar">
                    {review.user_name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <strong>{review.user_name}</strong>

                    <span>{review.user_email}</span>
                  </div>
                </div>

                <div className="review-date">
                  {new Date(review.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="review-actions">
                <button
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
                  className="action-btn delete"
                  onClick={() => handleDelete(review.id)}
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
    </div>
  );
}

export default AdminReviews;
