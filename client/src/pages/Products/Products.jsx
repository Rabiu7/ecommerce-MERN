import "./Products.css";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../../components/ProductCard/ProductCard";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("featured");

  const [categories, setCategories] = useState(["All"]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState(null);

  const limit = 12;

  // =========================================================
  // CATEGORY FROM URL
  // =========================================================

  const category = searchParams.get("category") || "All";

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/categories`);

        if (!response.ok) {
          throw new Error("Unable to load categories");
        }

        const data = await response.json();

        setCategories(["All", ...data.map((item) => item.name)]);
      } catch (error) {
        console.error("Category loading error:", error);
      }
    };

    loadCategories();
  }, []);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        params.set("page", page);
        params.set("limit", limit);

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "All") {
          params.set("category", category);
        }

        params.set("sort", sort);

        const response = await fetch(
          `${VITE_API_URL}/api/products/paginated?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        const data = await response.json();

        console.log("Products response:", data);

        setProducts(data.products || []);

        setPagination(data.pagination || null);
      } catch (error) {
        console.error("Product loading error:", error);

        setProducts([]);

        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, search, category, sort]);

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (cat) => {
    setPage(1);

    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({
        category: cat,
      });
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);

    // Start from first page
    setPage(1);
  };

  // =========================================================
  // SORT
  // =========================================================

  const handleSortChange = (event) => {
    setSort(event.target.value);

    // Start from first page
    setPage(1);
  };

  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  const previousPage = () => {
    if (pagination?.hasPreviousPage && !loading) {
      setPage((previousPage) => previousPage - 1);
    }
  };

  // =========================================================
  // NEXT PAGE
  // =========================================================

  const nextPage = () => {
    if (pagination?.hasNextPage && !loading) {
      setPage((previousPage) => previousPage + 1);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && products.length === 0) {
    return <div className="products-loading">Loading Products...</div>;
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <section className="products-page">
      <div className="container">
        {/* ===================================================
            PAGE TITLE
        =================================================== */}

        <div className="page-title">
          <span>OUR COLLECTION</span>

          <h1>Premium Home Collection</h1>

          <p>
            Beautiful products designed to elevate every corner of your home.
          </p>
        </div>

        <div className="products-layout">
          {/* =================================================
              SIDEBAR
          ================================================= */}

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

            <h3>{pagination?.totalProducts || 0} Products</h3>
          </aside>

          {/* =================================================
              PRODUCTS CONTENT
          ================================================= */}

          <div className="products-content">
            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="toolbar">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
              />

              <select value={sort} onChange={handleSortChange}>
                <option value="featured">Featured</option>

                <option value="low">Price: Low → High</option>

                <option value="high">Price: High → Low</option>

                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* =================================================
                PRODUCTS GRID
            ================================================= */}

            <div className="products-grid">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    publicId={product.public_id}
                    image={product.image}
                    title={product.name}
                    category={product.category}
                    price={product.price}
                    rating={product.rating}
                    stock={product.stock}
                  />
                ))
              ) : (
                <div className="products-empty">
                  <h3>No Products Found</h3>

                  <p>We couldn't find any products matching your selection.</p>
                </div>
              )}
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            {pagination && pagination.totalPages > 1 && (
              <div className="products-pagination">
                <button
                  type="button"
                  onClick={previousPage}
                  disabled={!pagination.hasPreviousPage || loading}
                >
                  Previous
                </button>

                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
