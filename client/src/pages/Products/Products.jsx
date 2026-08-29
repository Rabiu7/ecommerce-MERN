import "./Products.css";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  // URL query parameters
  const [searchParams, setSearchParams] = useSearchParams();

  // Read category from URL
  const category = searchParams.get("category") || "All";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Get categories from products
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Change category and URL
  const handleCategoryChange = (cat) => {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({
        category: cat,
      });
    }
  };

  const filteredProducts = useMemo(() => {
    let data = [...products];

    // Search
    if (search) {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Category
    if (category !== "All") {
      data = data.filter(
        (item) =>
          (item.category || "").toLowerCase() === category.toLowerCase(),
      );
    }

    // Sorting
    if (sort === "low") {
      data.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "high") {
      data.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sort === "rating") {
      data.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    return data;
  }, [products, search, category, sort]);

  if (loading) {
    return <div className="products-loading">Loading Products...</div>;
  }

  return (
    <section className="products-page">
      <div className="container">
        {/* PAGE TITLE */}

        <div className="page-title">
          <span>OUR COLLECTION</span>

          <h1>Premium Home Collection</h1>

          <p>
            Beautiful products designed to elevate every corner of your home.
          </p>
        </div>

        <div className="products-layout">
          {/* SIDEBAR */}

          <aside className="sidebar">
            <h3>Categories</h3>

            {categories.map((cat) => (
              <label key={cat}>
                <input
                  type="radio"
                  name="category"
                  checked={category === cat}
                  onChange={() => handleCategoryChange(cat)}
                />

                {cat}
              </label>
            ))}

            <hr />

            <h3>{filteredProducts.length} Products</h3>
          </aside>

          {/* PRODUCTS */}

          <div className="products-content">
            {/* TOOLBAR */}

            <div className="toolbar">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>

                <option value="low">Price: Low → High</option>

                <option value="high">Price: High → Low</option>

                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* PRODUCT GRID */}

            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    title={product.name}
                    category={product.category}
                    price={product.price}
                    rating={product.rating}
                  />
                ))
              ) : (
                <div className="products-empty">
                  <h3>No Products Found</h3>

                  <p>We couldn't find any products matching your selection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
