import "./Hero.css";
import heroImage from "../../assets/images/hero.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiStar,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiArrowUpRight,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Hero() {
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRating = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/reviews`);

        if (!response.ok) return;

        const products = await response.json();

        if (!Array.isArray(products)) return;

        const ratedProducts = products.filter(
          (product) =>
            product.rating !== null &&
            product.rating !== undefined &&
            Number.isFinite(Number(product.rating)) &&
            Number(product.rating) >= 4,
        );

        if (!ratedProducts.length) return;

        const totalRating = ratedProducts.reduce(
          (sum, product) => sum + Number(product.rating),
          0,
        );

        const average = totalRating / ratedProducts.length;

        if (!cancelled && average >= 4) {
          setAverageRating(average);
        }
      } catch (error) {
        console.error("Error fetching product ratings:", error);
      }
    };

    fetchRating();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hero-redesigned">
      <div className="hero-main">
        <div className="hero-container">
          {/* LEFT: HERO CONTENT */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-line" />
              <span>WELCOME TO ONLINE BAZAAR</span>
              <span className="hero-eyebrow-sparkle">✳</span>
            </div>

            <h1 className="hero-heading">
              Everyday living,
              <br />
              <span>thoughtfully</span>
              <br />
              <span className="hero-heading-highlight">
                made better<span className="hero-heading-period">.</span>
              </span>
            </h1>

            <p className="hero-description">
              Discover useful finds for your home and everyday life. Explore a
              collection made to bring convenience, comfort and a little more
              joy to your daily routine.
            </p>

            <div className="hero-buttons">
              <Link to="/products" className="hero-primary-btn">
                <span>Explore the collection</span>
                <span className="hero-primary-btn-icon">
                  <FiArrowUpRight />
                </span>
              </Link>

              <Link to="/products" className="hero-secondary-link">
                <span className="hero-secondary-link-icon">
                  <FiShoppingBag />
                </span>
                <span>Shop all products</span>
              </Link>
            </div>

            <div className="hero-social-proof">
              <div className="hero-proof-symbol">
                <FiCheckCircle />
              </div>
              <div className="hero-proof-copy">
                <strong>Find what fits your everyday</strong>
                <span>Browse a collection of practical essentials</span>
              </div>
            </div>

            <div className="hero-trust">
              {averageRating !== null && (
                <div className="hero-trust-item">
                  <span className="hero-trust-icon hero-trust-rating-icon">
                    <FiStar />
                  </span>
                  <span className="hero-trust-copy">
                    <strong>{averageRating.toFixed(1)} / 5</strong>
                    <span>Average product rating</span>
                  </span>
                </div>
              )}

              <span className="hero-trust-divider" />

              <div className="hero-trust-item">
                <span className="hero-trust-icon hero-trust-shield-icon">
                  <FiShield />
                </span>
                <span className="hero-trust-copy">
                  <strong>Secure shopping</strong>
                  <span>Shop with confidence</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: EDITORIAL PRODUCT VISUAL */}
          <div className="hero-visual">
            <div className="hero-visual-glow" />
            <div className="hero-visual-grid" />

            <div className="hero-visual-kicker">
              <span className="hero-kicker-dot" />
              GOOD FINDS. EVERYDAY.
            </div>

            <div className="hero-visual-frame">
              <div className="hero-visual-frame-inner">
                <img
                  src={heroImage}
                  alt="A selection of everyday home essentials"
                  fetchPriority="high"
                />
              </div>
            </div>

            <div className="hero-floating-note">
              <span className="hero-floating-note-icon">
                <FiShoppingBag />
              </span>
              <span className="hero-floating-note-copy">
                <strong>Your everyday picks</strong>
                <span>One place to explore</span>
              </span>
              <span className="hero-floating-note-arrow">
                <FiArrowRight />
              </span>
            </div>

            <div className="hero-side-label">
              <span>01</span>
              <span className="hero-side-label-line" />
              <span>THE COLLECTION</span>
            </div>

            <div className="hero-visual-stamp" aria-hidden="true">
              <span className="hero-stamp-top">MADE FOR</span>
              <span className="hero-stamp-main">DAILY</span>
              <span className="hero-stamp-bottom">LIVING ✳</span>
            </div>
          </div>
        </div>
      </div>

      {/* BENEFITS STRIP */}
      <div className="hero-benefits">
        <div className="hero-benefits-inner">
          <div className="hero-benefit-item">
            <span className="hero-benefit-icon">
              <FiShoppingBag />
            </span>
            <span className="hero-benefit-copy">
              <strong>Everyday essentials</strong>
              <span>Useful finds in one place</span>
            </span>
          </div>

          <span className="hero-benefit-divider" />

          <div className="hero-benefit-item">
            <span className="hero-benefit-icon">
              <FiTruck />
            </span>
            <span className="hero-benefit-copy">
              <strong>Convenient shopping</strong>
              <span>Browse whenever you like</span>
            </span>
          </div>

          <span className="hero-benefit-divider" />

          <div className="hero-benefit-item">
            <span className="hero-benefit-icon">
              <FiShield />
            </span>
            <span className="hero-benefit-copy">
              <strong>Secure checkout</strong>
              <span>Shop with confidence</span>
            </span>
          </div>

          <Link to="/products" className="hero-benefits-link">
            Discover more <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
