import "./Testimonials.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import { FiArrowUpRight, FiMessageCircle, FiUser } from "react-icons/fi";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const sliderRef = useRef(null);
  const currentIndexRef = useRef(0);

  const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // Load customer reviews from the existing API.
  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (!cancelled) {
          setReviews(Array.isArray(data) ? data.slice(0, 10) : []);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);

        if (!cancelled) {
          setReviews([]);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [VITE_API_URL]);

  // Adjust visible reviews to the screen width.
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth <= 600) {
        setItemsPerView(1);
      } else if (window.innerWidth <= 950) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);

    return () => {
      window.removeEventListener("resize", updateItemsPerView);
    };
  }, []);

  // Calculate carousel page positions.
  const pageStarts = useMemo(() => {
    if (reviews.length === 0) {
      return [];
    }

    const maxStart = Math.max(0, reviews.length - itemsPerView);
    const starts = [];

    for (let index = 0; index < reviews.length; index += itemsPerView) {
      const start = Math.min(index, maxStart);

      if (!starts.includes(start)) {
        starts.push(start);
      }
    }

    return starts;
  }, [reviews.length, itemsPerView]);

  // Scroll to a selected review.
  const scrollToIndex = useCallback((index) => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const card = slider.querySelector(".testimonial-card");

    if (!card) {
      return;
    }

    const cardWidth = card.getBoundingClientRect().width;
    const styles = window.getComputedStyle(slider);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    const scrollPosition = index * (cardWidth + gap);

    slider.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    currentIndexRef.current = index;
    setCurrentIndex(index);
  }, []);

  // Keep the carousel position valid after a resize or data update.
  useEffect(() => {
    if (reviews.length === 0) {
      return;
    }

    const maxStart = Math.max(0, reviews.length - itemsPerView);
    const newIndex = Math.min(currentIndexRef.current, maxStart);

    currentIndexRef.current = newIndex;
    setCurrentIndex(newIndex);

    const timer = setTimeout(() => {
      scrollToIndex(newIndex);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [itemsPerView, reviews.length, scrollToIndex]);

  // Update the active pagination dot during manual scrolling.
  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const handleScroll = () => {
      const card = slider.querySelector(".testimonial-card");

      if (!card) {
        return;
      }

      const cardWidth = card.getBoundingClientRect().width;
      const styles = window.getComputedStyle(slider);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const itemWidth = cardWidth + gap;

      if (itemWidth <= 0) {
        return;
      }

      const index = Math.round(slider.scrollLeft / itemWidth);

      if (index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        setCurrentIndex(index);
      }
    };

    slider.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      slider.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Automatically advance through review pages.
  useEffect(() => {
    if (reviews.length <= itemsPerView || pageStarts.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const current = currentIndexRef.current;

      let currentPage = 0;
      let smallestDistance = Infinity;

      pageStarts.forEach((start, index) => {
        const distance = Math.abs(start - current);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          currentPage = index;
        }
      });

      const nextPage = (currentPage + 1) % pageStarts.length;

      scrollToIndex(pageStarts[nextPage]);
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [reviews.length, itemsPerView, pageStarts, scrollToIndex]);

  // Hide the section when no reviews are available.
  if (reviews.length === 0) {
    return null;
  }

  let activeDot = 0;
  let smallestDistance = Infinity;

  pageStarts.forEach((start, index) => {
    const distance = Math.abs(start - currentIndex);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeDot = index;
    }
  });

  return (
    <div className="testimonials">
      <div className="testimonials-topline">
        <span className="testimonials-kicker">
          <FiMessageCircle />
          REAL EXPERIENCES
        </span>

        <span className="testimonials-count">
          {reviews.length} {reviews.length === 1 ? "REVIEW" : "REVIEWS"}
        </span>
      </div>

      <div
        ref={sliderRef}
        className="testimonial-grid"
        aria-label="Customer reviews"
      >
        {reviews.map((review, index) => {
          const customerName = review.user_name || "Customer";
          const rating = Math.min(5, Math.max(0, Number(review.rating) || 0));

          return (
            <article
              className="testimonial-card"
              key={review.id ?? `${customerName}-${index}`}
            >
              <div className="testimonial-card-top">
                <span className="testimonial-quote-mark" aria-hidden="true">
                  “
                </span>

                <span className="testimonial-card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="testimonial-rating">
                <div
                  className="testimonial-stars"
                  aria-label={`${rating} out of 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= rating ? "star-filled" : "star-empty"}
                    />
                  ))}
                </div>

                <span className="testimonial-rating-text">
                  {rating.toFixed(1)} / 5
                </span>
              </div>

              <blockquote className="testimonial-review">
                {review.comment || "Thank you for sharing your experience."}
              </blockquote>

              <div className="testimonial-divider" />

              <div className="testimonial-customer">
                <div className="testimonial-avatar">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      customerName,
                    )}&background=f3e6c7&color=765318&size=100&bold=true`}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <span aria-hidden="true">
                    <FiUser />
                  </span>
                </div>

                <div className="testimonial-customer-details">
                  <h3>{customerName}</h3>

                  <p>{review.product_name || "Purchased Product"}</p>
                </div>

                <span className="testimonial-customer-mark" aria-hidden="true">
                  <FiArrowUpRight />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {pageStarts.length > 1 && (
        <div className="testimonial-controls">
          <span className="testimonial-control-label">CUSTOMER VOICES</span>

          <div className="testimonial-dots" aria-label="Review pages">
            {pageStarts.map((start, index) => (
              <button
                key={start}
                type="button"
                aria-label={`Show review page ${index + 1}`}
                aria-current={activeDot === index ? "true" : undefined}
                className={
                  activeDot === index
                    ? "testimonial-dot active"
                    : "testimonial-dot"
                }
                onClick={() => scrollToIndex(start)}
              />
            ))}
          </div>

          <span className="testimonial-control-count">
            {String(activeDot + 1).padStart(2, "0")}
            <span>/</span>
            {String(pageStarts.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}

export default Testimonials;
