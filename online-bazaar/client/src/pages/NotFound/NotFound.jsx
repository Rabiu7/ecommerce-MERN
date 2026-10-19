import "./NotFound.css";

import { Link } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";

function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <div className="not-found-content">
          <div className="error-code">
            <span>4</span>
            <span className="zero">0</span>
            <span>4</span>
          </div>

          <span className="not-found-label">PAGE NOT FOUND</span>

          <h1>Oops! This Page Has Gone Missing.</h1>

          <p>
            The page you're looking for doesn't exist, has been moved, or may no
            longer be available. Let's get you back to something beautiful.
          </p>

          <div className="not-found-buttons">
            <Link to="/" className="home-btn">
              <FiHome />
              <span>Back to Home</span>
            </Link>

            <button className="back-btn" onClick={() => window.history.back()}>
              <FiArrowLeft />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
