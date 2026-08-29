import "./Home.css";
import { useEffect, useState } from "react";

import Hero from "../../components/Hero/Hero";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import OfferBanner from "../../components/OfferBanner/OfferBanner";
import Testimonials from "../../components/Testimonials/Testimonials";
import Newsletter from "../../components/Newsletter/Newsletter";

const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <main className="home">
      {/* HERO */}

      <Hero />

      {/* CATEGORIES */}

      <section className="categories">
        <div className="container">
          <div className="section-title">
            <span>Shop by Category</span>

            <h2>Essentials for Every Corner</h2>

            <p>
              Explore carefully selected essentials designed to make your
              everyday spaces more beautiful and functional.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((item) => (
              <CategoryCard
                key={item.id}
                id={item.id}
                title={item.name}
                image={item.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}

      <WhyChooseUs />

      {/* OFFER */}

      <OfferBanner />

      {/* TESTIMONIALS */}

      <Testimonials />

      {/* NEWSLETTER */}

      <Newsletter />
    </main>
  );
}

export default Home;
