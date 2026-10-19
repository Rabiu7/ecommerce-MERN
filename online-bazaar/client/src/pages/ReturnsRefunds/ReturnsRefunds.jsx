import "./ReturnsRefunds.css";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const returnSteps = [
  {
    number: "01",
    title: "Contact our team",
    description:
      "Contact customer support with your order details and explain the issue.",
    icon: FiPackage,
  },
  {
    number: "02",
    title: "Get your request reviewed",
    description:
      "Our team will review your request and explain the next steps.",
    icon: FiShield,
  },
  {
    number: "03",
    title: "Receive an update",
    description:
      "We will share the return instructions and any applicable refund information.",
    icon: FiRefreshCw,
  },
];

function ReturnsRefunds() {
  return (
    <main className="rr-page">
      <section className="rr-hero">
        <div className="rr-hero-inner">
          <div className="rr-eyebrow">
            <span />
            ONLINE BAZAAR CUSTOMER CARE
          </div>

          <h1>
            Returns made
            <br />
            <em>clear and simple.</em>
          </h1>

          <p>
            Need help with a purchase? Find out how to contact our team, request
            a return review, and understand the refund process.
          </p>

          <div className="rr-hero-actions">
            <a className="rr-button rr-button-dark" href="#return-process">
              How it works <FiArrowRight />
            </a>
            <Link className="rr-button rr-button-light" to="/help">
              Visit Help Center
            </Link>
          </div>

          <div className="rr-hero-note">
            <FiShield />
            <span>Your request will be reviewed by our support team.</span>
          </div>
        </div>

        <div className="rr-hero-art" aria-hidden="true">
          <div className="rr-art-circle">
            <div className="rr-art-card">
              <FiPackage className="rr-art-package" />
              <span>YOUR ORDER</span>
              <strong>Carefully handled.</strong>
              <div className="rr-art-line" />
              <div className="rr-art-status">
                <FiCheckCircle />
                Request review
              </div>
            </div>
          </div>
          <span className="rr-art-spark rr-spark-one">✳</span>
          <span className="rr-art-spark rr-spark-two">✦</span>
        </div>
      </section>

      <section className="rr-content">
        <div className="rr-intro">
          <span className="rr-kicker">HERE TO HELP</span>
          <h2>A better experience, even after checkout.</h2>
          <p>
            If something is not right with your order, our team can help you
            understand the options available for your purchase.
          </p>
        </div>

        <div className="rr-benefit-grid">
          <article className="rr-benefit">
            <span className="rr-icon-box">
              <FiPackage />
            </span>
            <h3>Order assistance</h3>
            <p>
              Keep your order details ready so our team can identify your
              purchase.
            </p>
          </article>

          <article className="rr-benefit">
            <span className="rr-icon-box">
              <FiClock />
            </span>
            <h3>Clear updates</h3>
            <p>
              Our support team will guide you through the applicable next steps.
            </p>
          </article>

          <article className="rr-benefit">
            <span className="rr-icon-box">
              <FiRefreshCw />
            </span>
            <h3>Refund guidance</h3>
            <p>
              Get information about refund eligibility and processing after
              review.
            </p>
          </article>
        </div>

        <section className="rr-process" id="return-process">
          <div className="rr-section-heading">
            <div>
              <span className="rr-kicker">THE PROCESS</span>
              <h2>How to request help</h2>
            </div>
            <p>Three simple steps to get started.</p>
          </div>

          <div className="rr-steps">
            {returnSteps.map((step) => {
              const StepIcon = step.icon;

              return (
                <article className="rr-step" key={step.number}>
                  <div className="rr-step-top">
                    <span>{step.number}</span>
                    <StepIcon />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rr-policy-grid">
          <article className="rr-policy-card">
            <span className="rr-kicker">BEFORE YOU REQUEST</span>
            <h2>What should you prepare?</h2>
            <ul>
              <li>
                <FiCheckCircle /> Your order number
              </li>
              <li>
                <FiCheckCircle /> The product name
              </li>
              <li>
                <FiCheckCircle /> A description of the issue
              </li>
              <li>
                <FiCheckCircle /> Photos, if they help explain the issue
              </li>
            </ul>
          </article>

          <article className="rr-policy-card rr-policy-card-dark">
            <span className="rr-kicker">REFUNDS</span>
            <h2>When will I receive my refund?</h2>
            <p>
              Eligibility and processing time can depend on the order, payment
              method, and outcome of the review. Contact our team for guidance
              specific to your purchase.
            </p>
            <Link to="/help" className="rr-text-link">
              Get help with an order <FiArrowRight />
            </Link>
          </article>
        </section>

        <section className="rr-contact">
          <div>
            <span className="rr-kicker">NEED A HAND?</span>
            <h2>Let's sort it out together.</h2>
            <p>Visit our Help Center to find answers and contact options.</p>
          </div>
          <Link to="/help" className="rr-button rr-button-dark">
            Get support <FiArrowRight />
          </Link>
        </section>

        <div className="rr-footer-note">
          Please refer to the applicable terms presented when placing your
          order. This page explains the general support process and does not
          establish a specific return window or refund guarantee.
        </div>
      </section>
    </main>
  );
}

export default ReturnsRefunds;
