import "./Hero.css";

import heroImage from "../../assets/images/hero.png";

import { Link } from "react-router-dom";

function Hero() {
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

            <div className="trust-divider"></div>

            <div>
              <strong>4.8★</strong>
              <span>Customer Rating</span>
            </div>
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
              <strong>Thoughtfully Selected</strong>
              <span>For modern homes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
