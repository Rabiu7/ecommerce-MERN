import "./Hero.css";

import heroImage from "../../assets/images/hero.png";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const VITE_API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.2.122:5000";

function Hero() {
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/reviews`);

        if (!response.ok) {
          return;
        }

        const products = await response.json();

        console.log("Review API Response:", products);

        const ratedProducts = products.filter(
          (product) =>
            product.rating !== null &&
            product.rating !== undefined &&
            Number(product.rating) >= 4
        );

        if (ratedProducts.length === 0) {
          return;
        }

        const totalRating = ratedProducts.reduce(
          (sum, product) => sum + Number(product.rating),
          0
        );

        const average = totalRating / ratedProducts.length;

        if (average >= 4) {
          setAverageRating(average);
        }
      } catch (error) {
        console.error("Error fetching product ratings:", error);
      }
    };

    fetchRating();
  }, []);

  return (
    <section className="hero">
      <div className="hero-container">
        {/* CONTENT */}

        <div className="hero-content">
          <span className="hero-label">Premium Home Collection</span>

          <h1>
            Everything
            <span>Your Home Deserves.</span>
          </h1>

          <p>
            Discover premium kitchen accessories, storage solutions, cleaning
            essentials, décor, and everyday home products designed for modern
            living.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>

            <Link to="/products" className="btn-secondary">
              Explore
              <span>→</span>
            </Link>
          </div>

          <div className="hero-trust">
            <div>
              <strong>100+</strong>
              <span>Quality Products</span>
            </div>

            {averageRating !== null && (
              <>
                <div className="trust-divider"></div>

                <div>
                  <strong>{averageRating.toFixed(1)}★</strong>
                  <span>Highly Rated</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* IMAGE */}

        <div className="hero-image">
          <div className="hero-image-frame">
            <img src={heroImage} alt="Premium home essentials" />
          </div>

          <div className="hero-image-decoration"></div>

          <div className="floating-card">
            <span className="floating-icon">✦</span>

            <div>
              <strong>Premium Home Essentials</strong>
              <span>Selected for modern living</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
