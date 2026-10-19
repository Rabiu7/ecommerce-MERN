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
  FiArrowUpRight,
  FiArrowRight,
} from "react-icons/fi";

import { Link } from "react-router-dom";

function Footer() {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Shop All Products", to: "/products" },
    { label: "Shopping Cart", to: "/cart" },
    { label: "My Account", to: "/profile" },
  ];

  const serviceLinks = [
    { label: "Help Center", to: "/help" },
    { label: "Shipping Policy", to: "/shipping-policy" },
    { label: "Returns & Refunds", to: "/returns-refunds" },
    { label: "Privacy Policy", to: "/privacy-policy" },
  ];

  const socialLinks = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/",
      icon: <FiFacebook />,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/",
      icon: <FiInstagram />,
    },
    {
      label: "Twitter",
      href: "https://twitter.com/",
      icon: <FiTwitter />,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/",
      icon: <FiLinkedin />,
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-container">
          {/* BRAND SECTION */}
          <div className="footer-brand">
            <Link
              to="/"
              className="footer-logo-link"
              aria-label="Online Bazaar Home"
            >
              <img src={logo} alt="Online Bazaar" className="footer-logo" />
            </Link>

            <span className="footer-brand-label">
              YOUR EVERYDAY SHOPPING DESTINATION
            </span>

            <p className="footer-brand-description">
              Discover everyday essentials, thoughtful finds, and useful
              products for your home and lifestyle — all in one place.
            </p>

            <div className="footer-social">
              <span className="footer-social-label">FOLLOW OUR JOURNEY</span>

              <div className="footer-social-list">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="footer-social-link"
                  >
                    {social.icon}
                    <FiArrowUpRight className="footer-social-arrow" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-column">
            <h3 className="footer-heading">Explore</h3>
            <span className="footer-heading-line" />

            <nav className="footer-link-list" aria-label="Explore links">
              {quickLinks.map((link) => (
                <Link key={link.label} to={link.to} className="footer-link">
                  <span>{link.label}</span>
                  <FiArrowRight className="footer-link-arrow" />
                </Link>
              ))}
            </nav>
          </div>

          {/* CUSTOMER SERVICE */}
          <div className="footer-column">
            <h3 className="footer-heading">Customer Care</h3>
            <span className="footer-heading-line" />

            <nav
              className="footer-link-list"
              aria-label="Customer service links"
            >
              {serviceLinks.map((link) => (
                <Link key={link.label} to={link.to} className="footer-link">
                  <span>{link.label}</span>
                  <FiArrowRight className="footer-link-arrow" />
                </Link>
              ))}
            </nav>
          </div>

          {/* CONTACT DETAILS */}
          <div className="footer-column footer-contact">
            <h3 className="footer-heading">Get in Touch</h3>
            <span className="footer-heading-line" />

            <p className="footer-contact-intro">
              Have a question? We're here to help with your shopping experience.
            </p>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Chennai,Tamil+Nadu,India"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <FiMapPin />
              </span>
              <span>
                <small>OUR LOCATION</small>
                Chennai, Tamil Nadu, India
              </span>
            </a>

            <a href="tel:+919876543210" className="footer-contact-item">
              <span className="footer-contact-icon">
                <FiPhone />
              </span>
              <span>
                <small>CALL US</small>
                +91 98765 43210
              </span>
            </a>

            <a
              href="mailto:support@homeneeds.com"
              className="footer-contact-item"
            >
              <span className="footer-contact-icon">
                <FiMail />
              </span>
              <span>
                <small>EMAIL SUPPORT</small>
                support@homeneeds.com
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            &copy; {new Date().getFullYear()} <strong>Online Bazaar</strong>.
            All rights reserved.
          </p>

          <Link to="/products" className="footer-bottom-link">
            Find your next favourite
            <FiArrowRight />
          </Link>

          <span className="footer-bottom-note">MADE FOR EVERYDAY LIVING</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
