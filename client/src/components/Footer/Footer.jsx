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
        <div className="footer-box footer-brand">
          <img src={logo} alt="HomeNeeds" className="footer-logo" />

          <p>
            Elevate your everyday living with premium home essentials, kitchen
            accessories, storage solutions, and modern décor.
          </p>

          <div className="footer-social">
            <a href="#">
              <FiFacebook />
            </a>

            <a href="#">
              <FiInstagram />
            </a>

            <a href="#">
              <FiTwitter />
            </a>

            <a href="#">
              <FiLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-box footer-brand">
          <h3>Quick Links</h3>

          <Link to="/">Home</Link>

          <Link to="/products">Products</Link>

          <Link to="/cart">Cart</Link>

          <Link to="/login">Login</Link>
        </div>

        <div className="footer-box footer-brand">
          <h3>Customer Service</h3>

          <Link to="#">Help Center</Link>

          <Link to="#">Shipping Policy</Link>

          <Link to="#">Returns & Refunds</Link>

          <Link to="#">Privacy Policy</Link>
        </div>

        <div className="footer-box footer-brand">
          <h3>Contact</h3>

          <p>
            <FiMapPin />
            Chennai, Tamil Nadu, India
          </p>

          <p>
            <FiPhone />
            +91 98765 43210
          </p>

          <p>
            <FiMail />
            support@homeneeds.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 <strong>HomeNeeds Store</strong>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
