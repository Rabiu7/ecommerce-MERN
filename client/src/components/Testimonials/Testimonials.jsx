import "./Testimonials.css";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/reviews`);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();

      // Only 10 reviews
      setReviews(data.slice(0, 10));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  /*
   * Automatically move to the next 3 reviews
   */
  useEffect(() => {
    if (reviews.length <= 3) {
      return;
    }

    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = prev + 3;

          // Start again from first review
          if (next >= reviews.length) {
            return 0;
          }

          return next;
        });

        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews]);

  if (reviews.length === 0) {
    return null;
  }

  /*
   * Get 3 reviews
   */
  const visibleReviews = [];

  for (let i = 0; i < 3; i++) {
    const index = (currentIndex + i) % reviews.length;

    visibleReviews.push(reviews[index]);
  }

  return (
    <section className="testimonials">
      <div className="container">
        {/* TITLE */}

        <div className="section-title">
          <span>Customer Stories</span>

          <h2>Loved by Our Customers</h2>

          <p>
            Hear from customers who have made our products part of their
            everyday homes.
          </p>
        </div>

        {/* REVIEWS */}

        <div
          className={`testimonial-grid ${isAnimating ? "reviews-slide" : ""}`}
        >
          {visibleReviews.map((review, index) => (
            <div
              className="testimonial-card"
              key={`${review.id}-${currentIndex}-${index}`}
            >
              {/* CUSTOMER */}

              <div className="testimonial-top">
                <div className="avatar">
                  {review.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{review.name}</h3>

                  <small>{review.product_name}</small>
                </div>
              </div>

              {/* STARS */}

              <div className="stars">
                {[...Array(Number(review.rating) || 0)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              {/* COMMENT */}

              <p className="review-text">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* DOTS */}

        <div className="testimonial-dots">
          {Array.from({ length: Math.ceil(reviews.length / 3) }, (_, index) => (
            <button
              key={index}
              className={
                Math.floor(currentIndex / 3) === index ? "dot active" : "dot"
              }
              onClick={() => {
                setCurrentIndex(index * 3);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
