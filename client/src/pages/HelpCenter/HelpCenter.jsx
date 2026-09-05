import "./HelpCenter.css";

import {
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiChevronDown,
} from "react-icons/fi";

import { Link } from "react-router-dom";
import { useState } from "react";

function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Browse our products, select the item you want, add it to your cart, and proceed to checkout. Enter your delivery details and complete the payment to place your order.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order has been shipped, you can track its status from your Orders section. Tracking information will also be provided when available.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We support the payment methods displayed during checkout. Available options may vary depending on your location and payment provider.",
    },
    {
      question: "Can I cancel my order?",
      answer:
        "Orders can generally be cancelled before they are shipped. Please contact our support team as soon as possible if you need to cancel an order.",
    },
    {
      question: "What should I do if I receive a damaged product?",
      answer:
        "Please contact us as soon as possible with your order details and photographs of the damaged product and packaging. Our team will review the issue and assist you.",
    },
    {
      question: "How can I contact HomeNeeds?",
      answer:
        "You can contact us through email or phone using the contact information provided at the bottom of this page.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="policy-page help-page">
      {/* HERO */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <span className="policy-eyebrow">CUSTOMER SUPPORT</span>

          <h1>
            How can we <span>help?</span>
          </h1>

          <p>
            Find answers to common questions about orders, payments, shipping,
            returns, and your HomeNeeds account.
          </p>
        </div>
      </section>

      {/* QUICK HELP */}
      <section className="help-section">
        <div className="policy-container">
          <div className="section-heading">
            <span>QUICK HELP</span>
            <h2>We're here for you</h2>
            <p>
              Find the information you need or get in touch with our support
              team.
            </p>
          </div>

          <div className="help-cards">
            <Link to="/products" className="help-card">
              <div className="help-icon">
                <FiShoppingBag />
              </div>

              <h3>Products & Orders</h3>

              <p>Browse products and learn more about placing an order.</p>

              <span className="help-card-link">Shop now →</span>
            </Link>

            <Link to="/shipping-policy" className="help-card">
              <div className="help-icon">
                <FiTruck />
              </div>

              <h3>Shipping</h3>

              <p>Learn about delivery times, shipping charges, and tracking.</p>

              <span className="help-card-link">View shipping →</span>
            </Link>

            <Link to="/returns-refunds" className="help-card">
              <div className="help-icon">
                <FiRefreshCw />
              </div>

              <h3>Returns & Refunds</h3>

              <p>Find information about returns, replacements, and refunds.</p>

              <span className="help-card-link">Learn more →</span>
            </Link>

            <Link to="/privacy-policy" className="help-card">
              <div className="help-icon">
                <FiUser />
              </div>

              <h3>Privacy & Security</h3>

              <p>Understand how we collect and protect your information.</p>

              <span className="help-card-link">Read policy →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="policy-container">
          <div className="section-heading">
            <span>FAQ</span>
            <h2>Frequently asked questions</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                className={`faq-item ${openFaq === index ? "faq-open" : ""}`}
                key={index}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>

                  <FiChevronDown />
                </button>

                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="support-section">
        <div className="policy-container">
          <div className="support-box">
            <div>
              <span>NEED MORE HELP?</span>

              <h2>Let's solve it together.</h2>

              <p>
                Our support team is happy to help with your HomeNeeds
                experience.
              </p>
            </div>

            <div className="support-actions">
              <a href="mailto:support@homeneeds.com" className="support-button">
                <FiMail />
                Email Support
              </a>

              <a
                href="tel:+919876543210"
                className="support-button support-button-outline"
              >
                <FiPhone />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HelpCenter;
