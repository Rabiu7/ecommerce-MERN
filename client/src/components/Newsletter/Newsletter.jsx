import "./Newsletter.css";

import { FiMail } from "react-icons/fi";

function Newsletter() {
  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-box">
          <div className="newsletter-content">
            <span>Stay Updated</span>

            <h2>Join Our Newsletter</h2>

            <p>
              Subscribe to receive exclusive offers, new arrivals, home styling
              tips, and special discounts directly in your inbox.
            </p>
          </div>

          <form className="newsletter-form">
            <div className="input-group">
              <FiMail />

              <input type="email" placeholder="Enter your email address" />
            </div>

            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
