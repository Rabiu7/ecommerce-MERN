import "./ReturnsRefunds.css";

import {
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";

function ReturnsRefunds() {
  return (
    <main className="policy-page returns-page">
      {/* HERO */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <span className="policy-eyebrow">SHOP WITH CONFIDENCE</span>

          <h1>
            Returns & <span>Refunds</span>
          </h1>

          <p>
            We want you to feel confident about every purchase you make with
            HomeNeeds.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="returns-intro">
        <div className="policy-container">
          <div className="returns-intro-content">
            <span>OUR PROMISE</span>

            <h2>
              If something isn't right,
              <em> we'll help make it right.</em>
            </h2>

            <p>
              If you receive an eligible product that is damaged, defective,
              incorrect, or otherwise qualifies under our return policy, please
              contact our support team as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* ELIGIBILITY */}
      <section className="returns-section">
        <div className="policy-container">
          <div className="section-heading">
            <span>RETURN ELIGIBILITY</span>
            <h2>When can I return an item?</h2>
          </div>

          <div className="return-columns">
            <div className="return-column return-allowed">
              <div className="return-column-header">
                <FiCheckCircle />
                <h3>Eligible situations</h3>
              </div>

              <ul>
                <li>Product arrived damaged.</li>
                <li>Product is defective or faulty.</li>
                <li>You received an incorrect item.</li>
                <li>Product does not match the order.</li>
                <li>Other cases specifically approved by our support team.</li>
              </ul>
            </div>

            <div className="return-column return-not-allowed">
              <div className="return-column-header">
                <FiXCircle />
                <h3>Generally not eligible</h3>
              </div>

              <ul>
                <li>Products damaged through misuse.</li>
                <li>Items altered after delivery.</li>
                <li>Products returned without approval.</li>
                <li>Items missing original components where applicable.</li>
                <li>Requests outside the applicable return period.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="return-process">
        <div className="policy-container">
          <div className="section-heading">
            <span>THE PROCESS</span>
            <h2>A simple four-step return</h2>
          </div>

          <div className="process-grid">
            <div className="process-step">
              <span>01</span>
              <FiMailIcon />
              <h3>Contact us</h3>
              <p>
                Send our support team your order details and explain the reason
                for the return.
              </p>
            </div>

            <div className="process-step">
              <span>02</span>
              <FiCheckCircle />
              <h3>Review</h3>
              <p>
                Our team will review your request and confirm whether the item
                qualifies.
              </p>
            </div>

            <div className="process-step">
              <span>03</span>
              <FiPackage />
              <h3>Return</h3>
              <p>
                If approved, follow the return instructions provided by our
                support team.
              </p>
            </div>

            <div className="process-step">
              <span>04</span>
              <FiCreditCard />
              <h3>Refund</h3>
              <p>
                Once the return is verified, your eligible refund will be
                processed according to the applicable payment method.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REFUND */}
      <section className="refund-section">
        <div className="policy-container">
          <div className="refund-box">
            <div className="refund-icon">
              <FiRefreshCw />
            </div>

            <div>
              <span>REFUNDS</span>

              <h2>How refunds work</h2>

              <p>
                Approved refunds are generally issued to the original payment
                method. The time it takes for the refunded amount to appear in
                your account can depend on your bank or payment provider.
              </p>

              <p>
                Shipping charges and other fees may be non-refundable unless
                otherwise required or agreed by HomeNeeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="policy-last-updated">Last updated: September 2026</div>
    </main>
  );
}

/* Small helper icon component */

function FiMailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export default ReturnsRefunds;
