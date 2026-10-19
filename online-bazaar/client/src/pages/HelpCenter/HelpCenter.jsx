import "./HelpCenter.css";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronDown,
  FiHelpCircle,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";

const categories = [
  { name: "All questions", icon: FiHelpCircle },
  { name: "Orders", icon: FiShoppingBag },
  { name: "Shipping", icon: FiTruck },
  { name: "Returns", icon: FiRefreshCw },
  { name: "Account & privacy", icon: FiShield },
];

const faqs = [
  {
    category: "Orders",
    question: "Where can I find my order details?",
    answer:
      "Sign in to your account and check your order history, if available. You can also refer to your order confirmation for the information provided at checkout.",
  },
  {
    category: "Orders",
    question: "Can I change or cancel my order?",
    answer:
      "Order changes or cancellations depend on the current order status. Contact customer support as soon as possible with your order number so the team can review your request.",
  },
  {
    category: "Orders",
    question: "What should I do if my order is incorrect?",
    answer:
      "Contact customer support with your order number and a description of the issue. Photos can help explain an incorrect or damaged item.",
  },
  {
    category: "Shipping",
    question: "How can I track my order?",
    answer:
      "Check your order details and any dispatch notification or tracking link provided for your purchase. If tracking information is unavailable, contact support for assistance.",
  },
  {
    category: "Shipping",
    question: "Why has my order not arrived yet?",
    answer:
      "Delivery timing can depend on your location, product availability, and the shipping service. Check your latest order updates and contact support if you need further assistance.",
  },
  {
    category: "Shipping",
    question: "Where can I find shipping charges?",
    answer:
      "Review the shipping information displayed during checkout and in your order confirmation. Any applicable charges should be checked before confirming the order.",
  },
  {
    category: "Returns",
    question: "How do I request a return?",
    answer:
      "Visit the Returns & Refunds page and contact customer support with your order number and the reason for your request. The team will explain the applicable process.",
  },
  {
    category: "Returns",
    question: "When will I receive my refund?",
    answer:
      "Refund eligibility and processing time depend on the order, payment method, and review outcome. Contact support for information specific to your purchase.",
  },
  {
    category: "Returns",
    question: "What if my product arrives damaged?",
    answer:
      "Keep your order details and, if possible, take clear photos of the damaged item and packaging. Contact support to have the issue reviewed.",
  },
  {
    category: "Account & privacy",
    question: "How do I manage my account?",
    answer:
      "Sign in to your Online Bazaar account and use the available account settings to review or update supported details.",
  },
  {
    category: "Account & privacy",
    question: "How is my personal information handled?",
    answer:
      "Read our Privacy Policy for information about personal data, its use, security, and related privacy matters.",
  },
  {
    category: "Account & privacy",
    question: "How can I ask a privacy-related question?",
    answer:
      "Use the customer support contact details published on the website to explain your request. Avoid including passwords or other sensitive authentication information.",
  },
];

function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All questions");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All questions" || faq.category === activeCategory;

      const matchesSearch =
        !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  function changeCategory(category) {
    setActiveCategory(category);
    setOpenFaq(null);
  }

  return (
    <main className="hc-page">
      <section className="hc-hero">
        <div className="hc-hero-content">
          <span className="hc-eyebrow">
            <span /> ONLINE BAZAAR SUPPORT
          </span>
          <h1>
            How can we
            <br />
            <em>help you today?</em>
          </h1>
          <p>
            Find quick answers about your orders, deliveries, returns, account,
            and privacy.
          </p>

          <form
            className="hc-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setOpenFaq(null);
              }}
              placeholder="Search your question..."
              aria-label="Search frequently asked questions"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </form>

          <div className="hc-popular">
            <span>POPULAR:</span>
            <button type="button" onClick={() => setSearchTerm("track")}>
              Track order
            </button>
            <button type="button" onClick={() => setSearchTerm("refund")}>
              Refunds
            </button>
            <button type="button" onClick={() => setSearchTerm("delivery")}>
              Delivery
            </button>
          </div>
        </div>

        <div className="hc-hero-visual" aria-hidden="true">
          <div className="hc-visual-ring">
            <div className="hc-help-illustration">
              <FiHelpCircle />
              <strong>We're here for you.</strong>
              <span>Answers, made simpler.</span>
            </div>
          </div>
          <span className="hc-deco hc-deco-one">✳</span>
          <span className="hc-deco hc-deco-two">✦</span>
        </div>
      </section>

      <section className="hc-content">
        <div className="hc-category-section">
          <div className="hc-heading">
            <span className="hc-kicker">BROWSE BY TOPIC</span>
            <h2>What do you need help with?</h2>
          </div>

          <div className="hc-categories">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              const selected = activeCategory === category.name;

              return (
                <button
                  type="button"
                  key={category.name}
                  className={`hc-category ${selected ? "is-active" : ""}`}
                  onClick={() => changeCategory(category.name)}
                  aria-pressed={selected}
                >
                  <CategoryIcon />
                  <span>{category.name}</span>
                  <FiArrowRight className="hc-category-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        <section className="hc-faq-section">
          <div className="hc-faq-heading">
            <div>
              <span className="hc-kicker">QUICK ANSWERS</span>
              <h2>Frequently asked questions</h2>
            </div>
            <span className="hc-result-count">
              {filteredFaqs.length}{" "}
              {filteredFaqs.length === 1 ? "question" : "questions"}
            </span>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="hc-faq-list">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === faq.question;

                return (
                  <article
                    className={`hc-faq ${isOpen ? "is-open" : ""}`}
                    key={faq.question}
                  >
                    <button
                      type="button"
                      className="hc-faq-question"
                      onClick={() => setOpenFaq(isOpen ? null : faq.question)}
                      aria-expanded={isOpen}
                    >
                      <span className="hc-faq-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="hc-faq-title">{faq.question}</span>
                      <FiChevronDown className="hc-faq-chevron" />
                    </button>

                    {isOpen && (
                      <div className="hc-faq-answer">
                        <span className="hc-faq-category">{faq.category}</span>
                        <p>{faq.answer}</p>
                        {faq.category === "Shipping" && (
                          <Link to="/shipping-policy">
                            Read shipping policy <FiArrowRight />
                          </Link>
                        )}
                        {faq.category === "Returns" && (
                          <Link to="/returns-refunds">
                            Read returns policy <FiArrowRight />
                          </Link>
                        )}
                        {faq.category === "Account & privacy" && (
                          <Link to="/privacy-policy">
                            Read privacy policy <FiArrowRight />
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="hc-empty">
              <FiSearch />
              <h3>No matching questions found</h3>
              <p>Try another search term or choose a different topic.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All questions");
                  setOpenFaq(null);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="hc-shortcuts">
          <div className="hc-shortcut-heading">
            <span className="hc-kicker">USEFUL LINKS</span>
            <h2>Find your way around.</h2>
          </div>
          <div className="hc-shortcut-grid">
            <Link to="/products" className="hc-shortcut">
              <FiShoppingBag />
              <span>
                <strong>Explore products</strong>
                <small>Browse the store</small>
              </span>
              <FiArrowRight />
            </Link>
            <Link to="/shipping-policy" className="hc-shortcut">
              <FiTruck />
              <span>
                <strong>Shipping policy</strong>
                <small>Understand delivery</small>
              </span>
              <FiArrowRight />
            </Link>
            <Link to="/returns-refunds" className="hc-shortcut">
              <FiRefreshCw />
              <span>
                <strong>Returns & refunds</strong>
                <small>Get return guidance</small>
              </span>
              <FiArrowRight />
            </Link>
            <Link to="/privacy-policy" className="hc-shortcut">
              <FiShield />
              <span>
                <strong>Privacy policy</strong>
                <small>Read about your data</small>
              </span>
              <FiArrowRight />
            </Link>
          </div>
        </section>

        <section className="hc-contact">
          <div className="hc-contact-mark">
            <FiHelpCircle />
          </div>
          <div>
            <span className="hc-kicker">STILL NEED HELP?</span>
            <h2>We'd be happy to help.</h2>
            <p>
              Contact our support team using the contact details published on
              Online Bazaar.
            </p>
          </div>
          <Link to="/returns-refunds" className="hc-contact-button">
            Order support <FiArrowRight />
          </Link>
        </section>
      </section>
    </main>
  );
}

export default HelpCenter;
