import "./Testimonials.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaStar } from "react-icons/fa";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const sliderRef = useRef(null);
  const currentIndexRef = useRef(0);

  const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        // Maximum 10 reviews
        setReviews(data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    loadReviews();
  }, [VITE_API_URL]);

  // =========================================================
  // RESPONSIVE ITEMS PER VIEW
  // =========================================================

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

  // =========================================================
  // PAGE START POSITIONS
  // =========================================================

  const pageStarts = useMemo(() => {
    if (reviews.length === 0) {
      return [];
    }

    const maxStart = Math.max(0, reviews.length - itemsPerView);

    const starts = [];

    for (let i = 0; i < reviews.length; i += itemsPerView) {
      const start = Math.min(i, maxStart);

      if (!starts.includes(start)) {
        starts.push(start);
      }
    }

    return starts;
  }, [reviews.length, itemsPerView]);

  // =========================================================
  // SCROLL TO REVIEW
  // =========================================================

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

  // =========================================================
  // RESET POSITION WHEN SCREEN SIZE CHANGES
  // =========================================================

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

  // =========================================================
  // DETECT MANUAL SWIPE / SCROLL
  // =========================================================

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

    slider.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      slider.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =========================================================
  // AUTOMATIC SLIDER
  // =========================================================

  useEffect(() => {
    if (reviews.length <= itemsPerView) {
      return;
    }

    if (pageStarts.length <= 1) {
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

  // =========================================================
  // NO REVIEWS
  // =========================================================

  if (reviews.length === 0) {
    return null;
  }

  // =========================================================
  // ACTIVE DOT
  // =========================================================

  let activeDot = 0;
  let smallestDistance = Infinity;

  pageStarts.forEach((start, index) => {
    const distance = Math.abs(start - currentIndex);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeDot = index;
    }
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="testimonials">
      <div className="container">
        {/* =====================================================
            TITLE
        ===================================================== */}

        <div className="section-title">
          <span>Customer Stories</span>

          <h2>Loved by Our Customers</h2>

          <p>
            Hear from customers who have made our products part of their
            everyday homes.
          </p>
        </div>

        {/* =====================================================
            REVIEWS CAROUSEL
        ===================================================== */}

        <div ref={sliderRef} className="testimonial-grid">
          {reviews.map((review) => (
            <div className="testimonial-card" key={review.id}>
              {/* CUSTOMER */}

              <div className="testimonial-top">
                <div className="avatar">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      review.user_name || "Customer",
                    )}&background=f3ede3&color=a27b3f&size=100&bold=true`}
                    alt={review.user_name || "Customer"}
                  />
                </div>

                <div className="customer-details">
                  <h3>{review.user_name || "Customer"}</h3>

                  <small>{review.product_name || "Purchased Product"}</small>
                </div>
              </div>

              {/* STARS */}

              <div className="stars">
                {[...Array(Number(review.rating) || 0)].map((_, index) => (
                  <FaStar key={index} />
                ))}
              </div>

              {/* COMMENT */}

              <p className="review-text">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* =====================================================
            DOTS
        ===================================================== */}

        {pageStarts.length > 1 && (
          <div className="testimonial-dots">
            {pageStarts.map((start, index) => (
              <button
                key={start}
                type="button"
                aria-label={`Show review page ${index + 1}`}
                className={activeDot === index ? "dot active" : "dot"}
                onClick={() => {
                  scrollToIndex(start);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
