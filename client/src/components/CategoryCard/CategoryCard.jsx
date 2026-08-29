import "./CategoryCard.css";

import { Link } from "react-router-dom";

function CategoryCard({ id, title, image }) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(title)}`}
      className="category-card"
    >
      <div className="category-image">
        <img src={image} alt={title} />
      </div>

      <div className="category-content">
        <h3>{title}</h3>

        <span>Explore Collection →</span>
      </div>
    </Link>
  );
}

export default CategoryCard;
