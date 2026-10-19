import "./Home.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiShoppingBag,
  FiGrid,
  FiStar,
  FiArrowUpRight,
} from "react-icons/fi";

import Hero from "../../components/Hero/Hero";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import OfferBanner from "../../components/OfferBanner/OfferBanner";
import Testimonials from "../../components/Testimonials/Testimonials";
import Newsletter from "../../components/Newsletter/Newsletter";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Home() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/categories`);

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="home home-redesigned">
      {/* 1. Hero and shopping benefits are handled inside Hero.jsx */}
      <Hero />

      {/* 2. Category discovery */}
      <section className="home-discovery-section">
        <div className="container">
          <div className="home-discovery-topline">
            <span className="home-eyebrow">
              <FiGrid />
              EXPLORE THE COLLECTION
            </span>

            <span className="home-discovery-note">
              Find something for your everyday needs
            </span>
          </div>

          <div className="home-discovery-heading">
            <div className="home-discovery-title">
              <h2>
                Find your
                <br />
                <span>everyday favourites.</span>
              </h2>

              <p>
                Browse our categories and discover products that fit your
                lifestyle, your space and your daily routine.
              </p>
            </div>

            <Link to="/products" className="home-discovery-link">
              <span>View all products</span>
              <span className="home-discovery-link-icon">
                <FiArrowUpRight />
              </span>
            </Link>
          </div>

          <div className="home-category-content">
            {categoriesLoading ? (
              <div
                className="home-category-state"
                aria-live="polite"
                aria-busy="true"
              >
                <span className="home-loading-spinner" />
                <p>Finding categories for you...</p>
              </div>
            ) : categories.length > 0 ? (
              <div className="home-category-grid">
                {categories.map((item, index) => (
                  <div
                    className="home-category-item"
                    key={item.id}
                    style={{ "--category-index": index }}
                  >
                    <CategoryCard
                      id={item.id}
                      title={item.name}
                      image={item.image}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-category-empty">
                <span className="home-category-empty-icon">
                  <FiShoppingBag />
                </span>

                <h3>Something good is on the way.</h3>

                <p>Our categories will appear here once they are available.</p>

                <Link to="/products" className="home-inline-link">
                  Browse products <FiArrowRight />
                </Link>
              </div>
            )}
          </div>

          {!categoriesLoading && categories.length > 0 && (
            <div className="home-category-footer">
              <span>
                <FiStar />
                Discover your next favourite
              </span>

              <Link to="/products">
                Explore the full collection <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. Why choose Online Bazaar */}
      <section className="home-why-section">
        <div className="container">
          <div className="home-section-intro">
            <span className="home-eyebrow">THE ONLINE BAZAAR EXPERIENCE</span>

            <h2>Thoughtful shopping, made simple.</h2>

            <p>
              A convenient place to discover everyday products and manage your
              shopping from one account.
            </p>
          </div>

          <div className="home-why-content">
            <WhyChooseUs />
          </div>
        </div>
      </section>

      {/* 4. Promotional banner */}
      <section className="home-offer-section">
        <div className="container">
          <div className="home-offer-heading">
            <div>
              <span className="home-eyebrow">WORTH A LOOK</span>

              <h2>A little something for your next shop.</h2>
            </div>

            <Link to="/products" className="home-offer-link">
              Shop products <FiArrowRight />
            </Link>
          </div>

          <div className="home-offer-content">
            <OfferBanner />
          </div>
        </div>
      </section>

      {/* 5. Customer testimonials */}
      <section className="home-reviews-section">
        <div className="container">
          <div className="home-reviews-heading">
            <div>
              <span className="home-eyebrow">CUSTOMER STORIES</span>

              <h2>Experiences worth sharing.</h2>
            </div>

            <span className="home-reviews-mark" aria-hidden="true">
              “
            </span>
          </div>

          <div className="home-reviews-content">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* 6. Newsletter */}
      <section className="home-newsletter-section">
        <div className="container">
          <div className="home-newsletter-frame">
            <div className="home-newsletter-side">
              <span className="home-eyebrow">STAY IN THE LOOP</span>

              <h2>
                Good finds.
                <br />
                Straight to your inbox.
              </h2>

              <p>Keep up with updates and news from Online Bazaar.</p>
            </div>

            <div className="home-newsletter-form">
              <Newsletter />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
