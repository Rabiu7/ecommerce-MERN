import "./CategoryCard.css";

import { Link } from "react-router-dom";
import { FiArrowUpRight, FiArrowRight } from "react-icons/fi";

function CategoryCard({ title, image }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(title)}`}
      className="category-card"
      aria-label={`Explore ${title} products`}
    >
      <article className="category-card-inner">
        <div className="category-image">
          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="category-image-placeholder">
              <span>{title?.charAt(0)?.toUpperCase() || "O"}</span>
            </div>
          )}

          <div className="category-image-overlay" />

          <span className="category-number">COLLECTION</span>

          <span className="category-top-arrow">
            <FiArrowUpRight />
          </span>
        </div>

        <div className="category-content">
          <div className="category-content-text">
            <span className="category-subtitle">DISCOVER MORE</span>

            <h3>{title}</h3>
          </div>

          <span className="category-explore">
            <FiArrowRight />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default CategoryCard;
