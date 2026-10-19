import "./Newsletter.css";

import { useState } from "react";
import { FiMail, FiArrowRight, FiCheckCircle } from "react-icons/fi";

function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // No newsletter subscription API is connected yet.
    // Connect the existing backend endpoint here when available.
  };

  return (
    <div className="newsletter">
      <div className="newsletter-box">
        <div className="newsletter-content">
          <span className="newsletter-eyebrow">
            <FiMail />
            STAY CONNECTED
          </span>

          <h2>
            A little inspiration,
            <br />
            delivered <span>to you.</span>
          </h2>

          <p>
            Subscribe to receive exclusive offers, new arrivals, home styling
            tips, and special discounts directly in your inbox.
          </p>

          <div className="newsletter-trust-note">
            <FiCheckCircle />
            <span>Only updates worth opening.</span>
          </div>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label>

          <div className="newsletter-input-wrap">
            <span className="newsletter-input-icon" aria-hidden="true">
              <FiMail />
            </span>

            <input
              id="newsletter-email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" className="newsletter-submit">
            <span>Subscribe</span>
            <FiArrowRight />
          </button>

          <p className="newsletter-privacy">
            By subscribing, you agree to receive email updates from Online
            Bazaar.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Newsletter;
