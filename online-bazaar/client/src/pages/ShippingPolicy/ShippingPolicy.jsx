import "./ShippingPolicy.css";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

const shippingSteps = [
  {
    number: "01",
    title: "Order placed",
    description: "Your order details are recorded after checkout.",
    icon: FiCheckCircle,
  },
  {
    number: "02",
    title: "Order processing",
    description: "Your order is prepared for dispatch.",
    icon: FiPackage,
  },
  {
    number: "03",
    title: "On its way",
    description:
      "Delivery progress can be checked when tracking details are available.",
    icon: FiTruck,
  },
];

function ShippingPolicy() {
  return (
    <main className="sp-page">
      <section className="sp-hero">
        <div className="sp-hero-content">
          <span className="sp-eyebrow">
            <span /> ONLINE BAZAAR DELIVERY GUIDE
          </span>
          <h1>
            From our store
            <br />
            <em>to your doorstep.</em>
          </h1>
          <p>
            Everything you need to know about order processing, shipping,
            delivery updates, and getting help with your order.
          </p>
          <div className="sp-hero-actions">
            <a href="#delivery-process" className="sp-button sp-button-dark">
              Explore delivery <FiArrowRight />
            </a>
            <Link to="/help" className="sp-button sp-button-outline">
              Need help?
            </Link>
          </div>
          <div className="sp-hero-note">
            <FiMapPin />
            <span>
              Delivery availability and timing depend on your order and
              location.
            </span>
          </div>
        </div>

        <div className="sp-visual" aria-hidden="true">
          <div className="sp-visual-orbit">
            <div className="sp-parcel">
              <div className="sp-parcel-top" />
              <FiPackage className="sp-parcel-icon" />
              <span>ONLINE BAZAAR</span>
            </div>
            <div className="sp-floating-tag">
              <FiTruck />
              <div>
                <strong>Delivery updates</strong>
                <small>Follow your order</small>
              </div>
            </div>
            <span className="sp-visual-star">✳</span>
          </div>
        </div>
      </section>

      <section className="sp-content">
        <div className="sp-section-intro">
          <span className="sp-kicker">DELIVERY, EXPLAINED</span>
          <h2>Know what happens after checkout.</h2>
          <p>
            The details below explain the general shipping journey. Check your
            order confirmation and tracking information for order-specific
            updates.
          </p>
        </div>

        <section className="sp-process" id="delivery-process">
          <div className="sp-process-heading">
            <div>
              <span className="sp-kicker">YOUR ORDER JOURNEY</span>
              <h2>Three stages. One clear journey.</h2>
            </div>
          </div>

          <div className="sp-timeline">
            {shippingSteps.map((step) => {
              const StepIcon = step.icon;

              return (
                <article className="sp-timeline-item" key={step.number}>
                  <div className="sp-timeline-marker">
                    <StepIcon />
                  </div>
                  <span className="sp-step-number">STEP {step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="sp-info-grid">
          <article className="sp-info-card">
            <span className="sp-card-icon">
              <FiClock />
            </span>
            <span className="sp-kicker">PROCESSING</span>
            <h3>When will my order be processed?</h3>
            <p>
              Processing time can vary by product and order circumstances. Refer
              to your order confirmation or contact support if you need an
              update.
            </p>
          </article>

          <article className="sp-info-card">
            <span className="sp-card-icon">
              <FiTruck />
            </span>
            <span className="sp-kicker">DELIVERY</span>
            <h3>How long will delivery take?</h3>
            <p>
              Delivery timing depends on your destination, item availability,
              and the shipping information provided for your order.
            </p>
          </article>

          <article className="sp-info-card">
            <span className="sp-card-icon">
              <FiMapPin />
            </span>
            <span className="sp-kicker">TRACKING</span>
            <h3>How can I track my order?</h3>
            <p>
              Check your order details and any tracking link or dispatch
              notification provided by Online Bazaar.
            </p>
          </article>
        </section>

        <section className="sp-shipping-details">
          <div className="sp-detail-copy">
            <span className="sp-kicker">GOOD TO KNOW</span>
            <h2>A few things to remember.</h2>
            <p>
              Before placing your order, make sure your delivery details are
              accurate and complete.
            </p>
          </div>
          <div className="sp-detail-list">
            <article>
              <span>01</span>
              <div>
                <h3>Check your address</h3>
                <p>
                  Confirm your shipping address and contact information during
                  checkout.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Review shipping charges</h3>
                <p>
                  Review any shipping fees shown at checkout before confirming
                  payment.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Report delivery issues</h3>
                <p>
                  Contact support if your parcel appears delayed, damaged, or
                  incorrect.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="sp-help-banner">
          <div className="sp-help-icon">
            <FiPackage />
          </div>
          <div className="sp-help-copy">
            <span className="sp-kicker">WE'RE HERE TO HELP</span>
            <h2>Have a question about your delivery?</h2>
            <p>Visit the Help Center for assistance with an existing order.</p>
          </div>
          <Link to="/help" className="sp-button sp-button-dark">
            Get help <FiArrowRight />
          </Link>
        </section>

        <p className="sp-disclaimer">
          Shipping fees, delivery estimates, service availability, and order
          processing conditions are subject to the details shown at checkout and
          in your order confirmation. No fixed delivery timeline is promised by
          this general information page.
        </p>
      </section>
    </main>
  );
}

export default ShippingPolicy;
