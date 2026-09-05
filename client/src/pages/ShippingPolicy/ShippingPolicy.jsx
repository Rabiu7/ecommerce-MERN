import "./ShippingPolicy.css";

import {
  FiTruck,
  FiMapPin,
  FiClock,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";

function ShippingPolicy() {
  return (
    <main className="policy-page shipping-page">
      {/* HERO */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <span className="policy-eyebrow">DELIVERY INFORMATION</span>

          <h1>
            Shipping <span>Policy</span>
          </h1>

          <p>
            Everything you need to know about how we prepare, ship, and deliver
            your HomeNeeds order.
          </p>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="shipping-overview">
        <div className="policy-container">
          <div className="section-heading">
            <span>THE HOME NEEDS STANDARD</span>

            <h2>
              Carefully packed.
              <br />
              Delivered with care.
            </h2>

            <p>
              We work to make every delivery simple, reliable, and transparent
              from the moment you place your order.
            </p>
          </div>

          <div className="shipping-cards">
            <div className="shipping-card">
              <FiPackage />
              <h3>Order Processing</h3>
              <p>
                Orders are normally processed within 1–3 business days after
                successful payment.
              </p>
            </div>

            <div className="shipping-card">
              <FiTruck />
              <h3>Delivery</h3>
              <p>
                Delivery times depend on your location, courier availability,
                and the selected shipping option.
              </p>
            </div>

            <div className="shipping-card">
              <FiMapPin />
              <h3>Tracking</h3>
              <p>
                When tracking is available, your tracking information will be
                shared once your order has been dispatched.
              </p>
            </div>

            <div className="shipping-card">
              <FiClock />
              <h3>Delivery Times</h3>
              <p>
                Estimated delivery dates may vary because of weekends, holidays,
                weather, or courier delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POLICY CONTENT */}
      <section className="shipping-content">
        <div className="policy-container">
          <div className="shipping-content-grid">
            <article>
              <span className="content-number">01</span>

              <h2>Shipping charges</h2>

              <p>
                Applicable shipping charges, if any, will be displayed during
                checkout before you complete your purchase.
              </p>

              <p>
                Promotional offers may include free shipping or reduced delivery
                charges for eligible orders.
              </p>
            </article>

            <article>
              <span className="content-number">02</span>

              <h2>Delivery address</h2>

              <p>
                Please make sure your delivery address and contact details are
                correct before placing your order.
              </p>

              <p>
                HomeNeeds cannot be responsible for delays caused by incorrect
                or incomplete delivery information.
              </p>
            </article>

            <article>
              <span className="content-number">03</span>

              <h2>Delayed deliveries</h2>

              <p>
                Occasionally, deliveries may take longer than estimated because
                of courier delays, severe weather, public holidays, or
                circumstances outside our control.
              </p>
            </article>

            <article>
              <span className="content-number">04</span>

              <h2>Damaged packages</h2>

              <p>
                If your package arrives visibly damaged, please document the
                condition of the package and contact our support team as soon as
                possible.
              </p>
            </article>
          </div>

          <div className="shipping-note">
            <FiAlertCircle />

            <div>
              <strong>Please note</strong>

              <p>
                Delivery estimates are provided for guidance and are not
                guaranteed delivery dates. Actual delivery times may vary
                depending on the destination and courier service.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="policy-last-updated">Last updated: September 2026</div>
    </main>
  );
}

export default ShippingPolicy;
