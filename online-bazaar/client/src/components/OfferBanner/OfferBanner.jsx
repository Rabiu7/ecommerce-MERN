import "./OfferBanner.css";

import { Link } from "react-router-dom";
import { FiArrowUpRight, FiArrowRight, FiTag } from "react-icons/fi";
import offer from "../../assets/images/offer.png";

function OfferBanner() {
  return (
    <section className="offer" aria-label="Special offer">
      <div className="offer-container">
        <div className="offer-content">
          <div className="offer-kicker">
            <span className="offer-kicker-icon">
              <FiTag />
            </span>
            <span>LIMITED-TIME OFFER</span>
          </div>

          <div className="offer-heading">
            <span className="offer-intro">A little more for less.</span>

            <h2>
              Make room
              <br />
              for <span>better.</span>
            </h2>

            <div className="offer-discount">
              <strong>20%</strong>
              <span>
                <b>OFF</b>
                <small>SELECTED FINDS</small>
              </span>
            </div>
          </div>

          <p className="offer-description">
            Refresh your home with premium furniture, kitchen essentials, décor,
            and storage solutions at unbeatable prices.
          </p>

          <div className="offer-actions">
            <Link to="/products" className="offer-button">
              <span>Shop Collection</span>
              <FiArrowRight />
            </Link>

            <span className="offer-note">
              Something special is waiting
              <FiArrowUpRight />
            </span>
          </div>

          <span className="offer-decoration" aria-hidden="true">
            ONLINE BAZAAR
          </span>
        </div>

        <div className="offer-image">
          <div className="offer-image-frame">
            <img
              src={offer}
              alt="Explore special offers on home essentials"
              loading="lazy"
            />
          </div>

          <div className="offer-image-badge">
            <span className="offer-badge-top">A GOOD FIND</span>
            <strong>20%</strong>
            <span className="offer-badge-bottom">SAVINGS</span>
          </div>

          <span className="offer-image-caption">
            Everyday essentials. Better value.
          </span>

          <span className="offer-image-orbit" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default OfferBanner;
