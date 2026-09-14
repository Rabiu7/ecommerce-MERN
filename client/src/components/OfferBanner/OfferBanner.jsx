import "./OfferBanner.css";

import offer from "../../assets/images/offer.png";

function OfferBanner() {
  return (
    <section className="offer">
      <div className="offer-container">
        <div className="offer-content">
          <span className="offer-label">Limited Time Offer</span>

          <h2>
            Save up to
            <br />
            <strong>20% OFF</strong>
          </h2>

          <p>
            Refresh your home with premium furniture, kitchen essentials, décor,
            and storage solutions at unbeatable prices.
          </p>

          <button>Shop Collection</button>
        </div>

        <div className="offer-image">
          <img src={offer} alt="Offer" />
        </div>
      </div>
    </section>
  );
}

export default OfferBanner;
