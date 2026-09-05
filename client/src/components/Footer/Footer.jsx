import "./Footer.css";
import logo from "../../assets/images/logo.png";

import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        {/* BRAND */}
        <div className="footer-box footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src={logo} alt="HomeNeeds" className="footer-logo" />
          </Link>

          <p>
            Elevate your everyday living with premium home essentials, kitchen
            accessories, storage solutions, and modern décor.
          </p>

          {/* SOCIAL MEDIA */}
          <div className="footer-social">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FiFacebook />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FiInstagram />
            </a>

            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <FiTwitter />
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FiLinkedin />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-box">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>

          <Link to="/products">Products</Link>

          <Link to="/cart">Cart</Link>

          <Link to="/login">Login</Link>
        </div>

        {/* CUSTOMER SERVICE */}
        <div className="footer-box">
          <h3>Customer Service</h3>

          <Link to="/help">Help Center</Link>

          <Link to="/shipping-policy">Shipping Policy</Link>

          <Link to="/returns-refunds">Returns & Refunds</Link>

          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>

        {/* CONTACT */}
        <div className="footer-box">
          <h3>Contact</h3>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Chennai,Tamil+Nadu,India"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-contact-link"
          >
            <FiMapPin />
            <span>Chennai, Tamil Nadu, India</span>
          </a>

          <a href="tel:+919876543210" className="footer-contact-link">
            <FiPhone />
            <span>+91 98765 43210</span>
          </a>

          <a
            href="mailto:support@homeneeds.com"
            className="footer-contact-link"
          >
            <FiMail />
            <span>support@homeneeds.com</span>
          </a>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        <p>
          © 2026 <strong>HomeNeeds Store</strong>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
