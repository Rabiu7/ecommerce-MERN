import "./PrivacyPolicy.css";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiChevronRight,
  FiEye,
  FiLock,
  FiShield,
  FiUser,
} from "react-icons/fi";

const sections = [
  { id: "introduction", title: "Introduction" },
  { id: "information", title: "Information we collect" },
  { id: "usage", title: "How information is used" },
  { id: "sharing", title: "Information sharing" },
  { id: "cookies", title: "Cookies and technologies" },
  { id: "security", title: "Data security" },
  { id: "rights", title: "Your choices and rights" },
  { id: "changes", title: "Policy updates" },
];

function PrivacyPolicy() {
  return (
    <main className="pp-page" id="privacy-top">
      <section className="pp-hero">
        <div className="pp-hero-content">
          <span className="pp-eyebrow">
            <span /> ONLINE BAZAAR TRUST CENTRE
          </span>
          <h1>
            Your privacy.
            <br />
            <em>Your choice.</em>
          </h1>
          <p>
            Learn how personal information may be collected, used, and protected
            when you browse or shop with Online Bazaar.
          </p>
          <div className="pp-hero-meta">
            <span>
              <FiShield /> Privacy information
            </span>
            <span>
              <FiLock /> Shop with awareness
            </span>
          </div>
        </div>

        <div className="pp-hero-visual" aria-hidden="true">
          <div className="pp-visual-ring">
            <div className="pp-shield-card">
              <FiShield className="pp-big-shield" />
              <span>ONLINE BAZAAR</span>
              <strong>Privacy matters.</strong>
              <div className="pp-shield-line" />
              <div className="pp-shield-status">
                <FiLock /> Your information deserves care
              </div>
            </div>
          </div>
          <span className="pp-star pp-star-one">✳</span>
          <span className="pp-star pp-star-two">✦</span>
        </div>
      </section>

      <section className="pp-content">
        <div className="pp-intro">
          <div className="pp-intro-icon">
            <FiEye />
          </div>
          <div>
            <span className="pp-kicker">A CLEAR EXPLANATION</span>
            <h2>Understand how your information is handled.</h2>
            <p>
              This page outlines common privacy topics relevant to an online
              store. The final policy should accurately reflect the information
              Online Bazaar collects, the services it uses, and the choices
              available to customers.
            </p>
          </div>
        </div>

        <div className="pp-document-layout">
          <aside className="pp-toc">
            <span className="pp-toc-heading">ON THIS PAGE</span>
            <nav aria-label="Privacy policy sections">
              {sections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                  <FiChevronRight />
                </a>
              ))}
            </nav>
            <div className="pp-toc-note">
              <FiShield />
              <p>Read the sections relevant to how you use our store.</p>
            </div>
          </aside>

          <article className="pp-document">
            <section className="pp-doc-section" id="introduction">
              <span className="pp-section-number">01</span>
              <h2>Introduction</h2>
              <p>
                Online Bazaar values transparency about personal information.
                This Privacy Policy explains the categories of information that
                may be handled when you visit the website, create an account,
                place an order, or contact customer support.
              </p>
              <p>
                The final published policy must identify the responsible
                business and explain the practices that actually apply to this
                website.
              </p>
            </section>

            <section className="pp-doc-section" id="information">
              <span className="pp-section-number">02</span>
              <h2>Information we collect</h2>
              <p>
                Depending on how the website is configured, information may
                include:
              </p>
              <ul>
                <li>
                  <strong>Contact information:</strong> details such as your
                  name, email address, telephone number, and delivery address
                  when you provide them.
                </li>
                <li>
                  <strong>Order information:</strong> items purchased, order
                  history, delivery details, and information needed to support
                  an order.
                </li>
                <li>
                  <strong>Account information:</strong> details associated with
                  your account and its settings.
                </li>
                <li>
                  <strong>Technical information:</strong> information such as
                  browser or device details and website activity, where these
                  are collected.
                </li>
                <li>
                  <strong>Support communications:</strong> information you
                  include when contacting customer support.
                </li>
              </ul>
              <p>
                Only categories that Online Bazaar actually collects should
                remain in the final published version.
              </p>
            </section>

            <section className="pp-doc-section" id="usage">
              <span className="pp-section-number">03</span>
              <h2>How information is used</h2>
              <p>Where applicable, personal information may be used to:</p>
              <ul>
                <li>Process and manage orders and deliveries.</li>
                <li>
                  Maintain customer accounts and provide requested services.
                </li>
                <li>Respond to enquiries and resolve order-related issues.</li>
                <li>
                  Maintain website reliability, prevent misuse, and protect
                  transactions.
                </li>
                <li>Meet applicable legal and regulatory obligations.</li>
              </ul>
              <p>
                Any additional uses, including promotional communications or
                analytics, should be described accurately and handled according
                to applicable consent and legal requirements.
              </p>
            </section>

            <section className="pp-doc-section" id="sharing">
              <span className="pp-section-number">04</span>
              <h2>Information sharing</h2>
              <p>
                An online store may need to share relevant information with
                service providers to complete customer-requested activities,
                such as payment processing, shipping, hosting, or customer
                support.
              </p>
              <p>
                Information may also need to be disclosed where required by law.
                The final policy should identify the categories of recipients
                that Online Bazaar actually uses and explain the applicable
                safeguards.
              </p>
            </section>

            <section className="pp-doc-section" id="cookies">
              <span className="pp-section-number">05</span>
              <h2>Cookies and technologies</h2>
              <p>
                Websites may use cookies or similar technologies to support
                essential functions, remember preferences, maintain sessions, or
                measure website performance.
              </p>
              <p>
                The cookies and tracking technologies actually used by Online
                Bazaar, their purposes, and any available preference controls
                should be described here. You can also review the controls
                offered by your browser.
              </p>
            </section>

            <section className="pp-doc-section" id="security">
              <span className="pp-section-number">06</span>
              <h2>Data security</h2>
              <p>
                Appropriate safeguards should be used to protect personal
                information against unauthorised access, loss, misuse, or
                disclosure. No method of storage or transmission can be
                guaranteed to be completely secure.
              </p>
              <p>
                The final policy should reflect the actual security measures and
                data-handling practices used by the business.
              </p>
            </section>

            <section className="pp-doc-section" id="rights">
              <span className="pp-section-number">07</span>
              <h2>Your choices and rights</h2>
              <p>
                Depending on applicable law and the circumstances, you may have
                rights relating to access, correction, deletion, or certain uses
                of your personal information.
              </p>
              <p>
                The process for submitting a privacy request, the available
                choices, and any applicable limitations should be specified
                according to the laws that apply to Online Bazaar.
              </p>
              <div className="pp-rights-note">
                <FiUser />
                <div>
                  <strong>Have a privacy question?</strong>
                  <p>
                    Use the support contact details published on our website to
                    ask about your information.
                  </p>
                  <Link to="/help">
                    Visit the Help Center <FiArrowUpRight />
                  </Link>
                </div>
              </div>
            </section>

            <section className="pp-doc-section" id="changes">
              <span className="pp-section-number">08</span>
              <h2>Policy updates</h2>
              <p>
                This policy may need to be updated when the website's data
                practices or applicable requirements change. The published
                version should show its effective or last-updated date and
                explain how significant changes will be communicated, where
                required.
              </p>
            </section>

            <div className="pp-document-footer">
              <FiShield />
              <p>
                This page is a structural template. Confirm the actual data
                practices, business identity, legal requirements, and customer
                contact details before publishing it as your official policy.
              </p>
            </div>
          </article>
        </div>

        <section className="pp-bottom-banner">
          <div>
            <span className="pp-kicker">NEED MORE INFORMATION?</span>
            <h2>We're here to help you find answers.</h2>
            <p>
              Visit the Help Center for customer support and useful information.
            </p>
          </div>
          <Link to="/help" className="pp-button">
            Visit Help Center <FiArrowUpRight />
          </Link>
        </section>

        <a className="pp-back-top" href="#privacy-top">
          Back to top <span>↑</span>
        </a>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
