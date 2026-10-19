import "./Products.css";

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiGrid,
  FiSearch,
  FiSliders,
  FiX,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";

import ProductCard from "../../components/ProductCard/ProductCard";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("featured");
  const [categories, setCategories] = useState(["All"]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const limit = 12;
  const category = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";

  // Keep the search input in sync with searches coming from the Navbar URL.
  useEffect(() => {
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);

  // Load available categories.
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoryLoading(true);

        const response = await fetch(`${VITE_API_URL}/api/categories`);

        if (!response.ok) {
          throw new Error("Unable to load categories");
        }

        const data = await response.json();

        if (!cancelled) {
          const categoryList = Array.isArray(data) ? data : [];

          setCategories([
            "All",
            ...categoryList.map((item) => item.name).filter(Boolean),
          ]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Category loading error:", error);
        }
      } finally {
        if (!cancelled) {
          setCategoryLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load paginated products whenever the filters change.
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("sort", sort);

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (category !== "All") {
          params.set("category", category);
        }

        const response = await fetch(
          `${VITE_API_URL}/api/products/paginated?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        const data = await response.json();

        if (!cancelled) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setPagination(data.pagination || null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Product loading error:", error);
          setProducts([]);
          setPagination(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [page, search, category, sort]);

  const handleCategoryChange = (selectedCategory) => {
    setPage(1);

    const params = {};

    if (selectedCategory !== "All") {
      params.category = selectedCategory;
    }

    if (search.trim()) {
      params.search = search.trim();
    }

    setSearchParams(params);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);

    const params = {};

    if (category !== "All") {
      params.category = category;
    }

    setSearchParams(params);
  };

  const previousPage = () => {
    if (pagination?.hasPreviousPage && !loading) {
      setPage((currentPage) => Math.max(1, currentPage - 1));
    }
  };

  const nextPage = () => {
    if (pagination?.hasNextPage && !loading) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSort("featured");
    setPage(1);
    setSearchParams({});
  };

  const totalProducts = pagination?.totalProducts ?? products.length;

  return (
    <main className="products-page">
      {/* Editorial hero */}
      <section className="products-hero">
        <div className="products-hero-inner">
          <div className="products-breadcrumb">
            <Link to="/">Home</Link>
            <FiArrowRight />
            <span>Shop</span>

            {category !== "All" && (
              <>
                <FiArrowRight />
                <strong>{category}</strong>
              </>
            )}
          </div>

          <div className="products-hero-content">
            <div className="products-hero-copy">
              <span className="products-eyebrow">
                <span className="products-eyebrow-dot" />
                THE EVERYDAY COLLECTION
              </span>

              <h1>
                A little better
                <br />
                <span>in every corner.</span>
              </h1>

              <p>
                Discover thoughtful essentials that bring comfort, beauty and
                function into your everyday spaces.
              </p>

              <div className="products-hero-actions">
                <a href="#product-collection" className="products-hero-cta">
                  Explore products
                  <FiArrowRight />
                </a>

                <span className="products-hero-caption">
                  Thoughtful finds. Everyday living.
                </span>
              </div>

              <div className="products-hero-note">
                <span className="products-hero-note-icon">
                  <FiGrid />
                </span>

                <span>
                  <strong>Made for everyday living</strong>
                  <small>
                    Explore the collection and find your favourites.
                  </small>
                </span>
              </div>
            </div>

            <div className="products-hero-art" aria-hidden="true">
              <div className="products-art-circle products-art-circle-one" />
              <div className="products-art-circle products-art-circle-two" />

              <div className="products-art-card">
                <span className="products-art-overline">
                  YOUR SPACE, YOUR STYLE
                </span>

                <div className="products-art-symbol">
                  <FiGrid />
                </div>

                <strong>Everyday essentials.</strong>
                <span>Beautifully considered.</span>

                <div className="products-art-bottom">
                  <span>THE COLLECTION</span>
                  <FiArrowUpRight />
                </div>
              </div>

              <span className="products-art-spark products-art-spark-one">
                ✳
              </span>

              <span className="products-art-spark products-art-spark-two">
                ✦
              </span>

              <div className="products-art-side-label">THE ART OF EVERYDAY</div>
            </div>
          </div>

          <div className="products-hero-footer">
            <span>01 / EVERYDAY FINDS</span>
            <span>DISCOVER SOMETHING LOVELY</span>
          </div>
        </div>
      </section>

      {/* Product collection */}
      <section className="products-catalog" id="product-collection">
        <div className="products-catalog-inner">
          <div className="products-heading">
            <div className="products-heading-copy">
              <span className="products-eyebrow">FIND YOUR FAVOURITES</span>

              <h2>
                Explore the collection<span>.</span>
              </h2>

              <p>Everyday finds to make your space feel more like you.</p>
            </div>

            <div className="products-total">
              <span className="products-total-icon">
                <FiShoppingBag />
              </span>

              <span className="products-total-copy">
                <strong>{totalProducts}</strong>
                <small>products to explore</small>
              </span>
            </div>
          </div>

          <div className="products-layout">
            {/* Filters */}
            <aside className="products-sidebar">
              <div className="products-sidebar-heading">
                <span className="products-sidebar-icon">
                  <FiSliders />
                </span>

                <div>
                  <h3>Find your fit</h3>
                  <p>Refine the collection</p>
                </div>
              </div>

              <div className="products-filter-group">
                <div className="products-filter-title">
                  <h4>Categories</h4>
                  <span>{Math.max(categories.length - 1, 0)}</span>
                </div>

                {categoryLoading ? (
                  <div className="products-category-loading">
                    <span className="products-spinner" />
                    Loading categories...
                  </div>
                ) : (
                  <div className="products-category-list">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`products-category-option ${
                          category === cat ? "selected" : ""
                        }`}
                        onClick={() => handleCategoryChange(cat)}
                        aria-pressed={category === cat}
                      >
                        <span className="products-category-radio">
                          {category === cat && (
                            <span className="products-category-radio-inner" />
                          )}
                        </span>

                        <span className="products-category-name">{cat}</span>

                        {category === cat && (
                          <FiArrowRight className="products-category-arrow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="products-sidebar-promo">
                <span className="products-promo-spark">✳</span>
                <span className="products-promo-label">A GOOD FIND</span>

                <h4>Small details. Big difference.</h4>

                <p>Explore essentials that make everyday life feel special.</p>

                <button type="button" onClick={clearFilters}>
                  Browse all
                  <FiArrowRight />
                </button>
              </div>

              <div className="products-sidebar-footer">
                <span className="products-sidebar-footer-icon">
                  <FiRefreshCw />
                </span>

                <span>
                  <strong>Still exploring?</strong>
                  <small>Reset your filters anytime.</small>
                </span>
              </div>
            </aside>

            {/* Results and product grid */}
            <div className="products-content">
              <div className="products-toolbar">
                <label className="products-search">
                  <FiSearch className="products-search-icon" />

                  <input
                    type="search"
                    placeholder="Search the collection..."
                    value={search}
                    onChange={handleSearchChange}
                    aria-label="Search products"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                    >
                      <FiX />
                    </button>
                  )}
                </label>

                <label className="products-sort">
                  <span>Sort by</span>

                  <select value={sort} onChange={handleSortChange}>
                    <option value="featured">Featured</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </label>
              </div>

              <div className="products-results-bar">
                <div className="products-results-copy">
                  <span className="products-results-indicator" />
                  <span>
                    {loading ? (
                      "Updating collection..."
                    ) : (
                      <>
                        Showing <strong>{totalProducts}</strong> products
                      </>
                    )}
                  </span>
                </div>

                {(category !== "All" || search || sort !== "featured") && (
                  <button
                    type="button"
                    className="products-clear-filters"
                    onClick={clearFilters}
                  >
                    Clear filters
                    <FiX />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="products-loading-panel" role="status">
                  <span className="products-spinner" />

                  <strong>Finding your favourites...</strong>

                  <p>Just a moment while we load the collection.</p>
                </div>
              ) : products.length > 0 ? (
                <div className="products-grid">
                  {products.map((product) => (
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
                  ))}
                </div>
              ) : (
                <div className="products-empty">
                  <span className="products-empty-icon">
                    <FiSearch />
                  </span>

                  <span className="products-eyebrow">
                    NOTHING HERE JUST YET
                  </span>

                  <h3>
                    No products found<span>.</span>
                  </h3>

                  <p>
                    We couldn't find products matching your search. Try another
                    keyword or browse the full collection.
                  </p>

                  <button
                    type="button"
                    className="products-reset-button"
                    onClick={clearFilters}
                  >
                    View all products
                    <FiArrowRight />
                  </button>
                </div>
              )}

              {pagination && pagination.totalPages > 1 && !loading && (
                <nav className="products-pagination" aria-label="Product pages">
                  <button
                    type="button"
                    className="products-page-button"
                    onClick={previousPage}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <FiArrowRight className="products-previous-icon" />
                    Previous
                  </button>

                  <div className="products-page-indicator">
                    <span className="products-page-label">PAGE</span>

                    <strong>{pagination.currentPage}</strong>

                    <span className="pagination-separator">/</span>

                    <span>{pagination.totalPages}</span>
                  </div>

                  <button
                    type="button"
                    className="products-page-button products-next-button"
                    onClick={nextPage}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <FiArrowRight />
                  </button>
                </nav>
              )}

              {!loading && products.length > 0 && (
                <div className="products-bottom-note">
                  <span />
                  <p>Good things are worth discovering.</p>
                  <span />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Products;
