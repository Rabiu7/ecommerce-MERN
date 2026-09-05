import "./PrivacyPolicy.css";

import {
  FiShield,
  FiUser,
  FiDatabase,
  FiLock,
  FiEye,
  FiMail,
} from "react-icons/fi";

function PrivacyPolicy() {
  return (
    <main className="policy-page privacy-page">
      {/* HERO */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <span className="policy-eyebrow">YOUR PRIVACY MATTERS</span>

          <h1>
            Privacy <span>Policy</span>
          </h1>

          <p>
            This policy explains how HomeNeeds collects, uses, and protects
            information when you use our website and services.
          </p>
        </div>
      </section>

      {/* PRIVACY INTRO */}
      <section className="privacy-intro">
        <div className="policy-container">
          <div className="privacy-intro-grid">
            <div>
              <FiShield className="privacy-main-icon" />
            </div>

            <div>
              <span>OUR COMMITMENT</span>

              <h2>
                Your information deserves
                <em> respect and care.</em>
              </h2>

              <p>
                HomeNeeds is committed to handling customer information
                responsibly. We collect only the information reasonably
                necessary to provide our products and services, process orders,
                communicate with customers, and improve our website.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DATA TYPES */}
      <section className="privacy-data">
        <div className="policy-container">
          <div className="section-heading">
            <span>INFORMATION WE COLLECT</span>
            <h2>What information may we receive?</h2>
          </div>

          <div className="privacy-cards">
            <div className="privacy-card">
              <FiUser />

              <h3>Account Information</h3>

              <p>
                Information such as your name, email address, phone number, and
                account details when you create or use an account.
              </p>
            </div>

            <div className="privacy-card">
              <FiDatabase />

              <h3>Order Information</h3>

              <p>
                Details necessary to process and fulfil your purchases,
                including delivery information and order history.
              </p>
            </div>

            <div className="privacy-card">
              <FiCreditCardIcon />

              <h3>Payment Information</h3>

              <p>
                Payment details may be processed through our payment providers.
                We do not need to store complete payment card information
                ourselves.
              </p>
            </div>

            <div className="privacy-card">
              <FiEye />

              <h3>Website Usage</h3>

              <p>
                We may collect technical and usage information to help maintain
                security, understand website performance, and improve our
                services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POLICY DETAILS */}
      <section className="privacy-details">
        <div className="policy-container">
          <article>
            <span>01</span>

            <div>
              <h2>How we use information</h2>

              <p>
                Information may be used to process and deliver orders, provide
                customer support, manage accounts, communicate important service
                updates, prevent fraud, and improve the HomeNeeds experience.
              </p>
            </div>
          </article>

          <article>
            <span>02</span>

            <div>
              <h2>Information security</h2>

              <p>
                We take reasonable technical and organisational measures
                designed to protect information against unauthorised access,
                alteration, disclosure, or destruction.
              </p>
            </div>
          </article>

          <article>
            <span>03</span>

            <div>
              <h2>Sharing information</h2>

              <p>
                We may share relevant information with trusted service providers
                when necessary to operate our business, such as payment
                processing, shipping, hosting, analytics, and customer support.
              </p>
            </div>
          </article>

          <article>
            <span>04</span>

            <div>
              <h2>Your choices</h2>

              <p>
                Depending on applicable law, you may have rights concerning
                access, correction, deletion, or other handling of your personal
                information. Contact us if you would like to make a
                privacy-related request.
              </p>
            </div>
          </article>

          <article>
            <span>05</span>

            <div>
              <h2>Cookies</h2>

              <p>
                Our website may use cookies or similar technologies to remember
                preferences, support functionality, understand website usage,
                and improve our services.
              </p>
            </div>
          </article>

          <article>
            <span>06</span>

            <div>
              <h2>Policy updates</h2>

              <p>
                We may update this Privacy Policy from time to time. Changes
                will be reflected on this page with an updated revision date.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CONTACT */}
      <section className="privacy-contact">
        <div className="policy-container">
          <div className="privacy-contact-box">
            <FiMail />

            <div>
              <span>PRIVACY QUESTIONS</span>

              <h2>Want to know more?</h2>

              <p>
                For privacy-related questions or requests, contact our support
                team.
              </p>

              <a href="mailto:support@homeneeds.com">support@homeneeds.com</a>
            </div>
          </div>
        </div>
      </section>

      <div className="policy-last-updated">Last updated: September 2026</div>
    </main>
  );
}

/* Payment icon */

function FiCreditCardIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export default PrivacyPolicy;
