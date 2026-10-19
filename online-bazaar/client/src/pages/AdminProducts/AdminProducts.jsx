import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPackage,
  FiPlus,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiImage,
  FiTag,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiPercent,
  FiBox,
  FiStar,
} from "react-icons/fi";
import "./AdminProducts.css";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PRODUCTS_PER_PAGE = 10;

const initialForm = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  discount: "0",
  stock: "0",
  image: null,
};

function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(searchParams.get("add") === "true");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);

  const searchInitialized = useRef(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchProducts = async (page = 1, searchValue = search) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${VITE_API_URL}/api/products/paginated`,
        {
          params: {
            page,
            limit: PRODUCTS_PER_PAGE,
            search: searchValue.trim(),
          },
        },
      );

      const data = response.data;

      setProducts(data.products || []);
      setCurrentPage(data.pagination?.currentPage || page);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProducts(data.pagination?.totalProducts || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);

        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${VITE_API_URL}/api/products/paginated`, {
            params: { page: 1, limit: PRODUCTS_PER_PAGE, search: "" },
          }),
          axios.get(`${VITE_API_URL}/api/categories`),
        ]);

        if (cancelled) return;

        const data = productsResponse.data;

        setProducts(data.products || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalProducts(data.pagination?.totalProducts || 0);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error("Error loading admin products data:", error);

        if (!cancelled) {
          if (error?.config?.url?.includes("/api/products")) {
            toast.error("Failed to load products.");
          } else if (error?.config?.url?.includes("/api/categories")) {
            toast.error("Failed to load categories.");
          } else {
            toast.error("Failed to load products and categories.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!searchInitialized.current) {
      searchInitialized.current = true;
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchProducts(1, search);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchProducts(1, "");
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchProducts(page, search);
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) pages.push(page);
      return pages;
    }

    pages.push(1);

    if (currentPage > 4) pages.push("...");

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page++) pages.push(page);

    if (currentPage < totalPages - 3) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageChange = (event) => {
    setForm((previous) => ({
      ...previous,
      image: event.target.files[0] || null,
    }));
  };

  const toggleAddForm = () => {
    const nextValue = !showForm;
    setShowForm(nextValue);
    setSearchParams(nextValue ? { add: "true" } : {});
  };

  const closeAddForm = () => {
    if (saving) return;
    setShowForm(false);
    setSearchParams({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter product name.");
      return;
    }

    if (!form.category_id) {
      toast.error("Please select a category.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (
      Number(form.discount) < 0 ||
      Number(form.discount) > 100 ||
      form.discount === ""
    ) {
      toast.error("Please enter a valid discount.");
      return;
    }

    if (Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("category_id", form.category_id);
      formData.append("price", form.price);
      formData.append("discount", form.discount || 0);
      formData.append("stock", form.stock || 0);

      if (form.image) formData.append("image", form.image);

      const response = await axios.post(
        `${VITE_API_URL}/api/products`,
        formData,
        getAuthConfig(),
      );

      console.log("Product created:", response.data);
      toast.success("Product added successfully!");

      setForm(initialForm);
      setShowForm(false);
      setSearchParams({});
      setSearch("");
      await fetchProducts(1, "");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (product) => {
    setEditProduct({ ...product, newImage: null });
  };

  const closeEditModal = () => {
    if (!editSaving) setEditProduct(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditProduct((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditImageChange = (event) => {
    setEditProduct((previous) => ({
      ...previous,
      newImage: event.target.files[0] || null,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editProduct) return;

    if (!editProduct.name?.trim()) {
      toast.error("Please enter product name.");
      return;
    }

    if (!editProduct.category_id) {
      toast.error("Please select a category.");
      return;
    }

    if (!editProduct.price || Number(editProduct.price) <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    if (
      editProduct.discount === "" ||
      Number(editProduct.discount) < 0 ||
      Number(editProduct.discount) > 100
    ) {
      toast.error("Please enter a valid discount.");
      return;
    }

    if (
      editProduct.stock === "" ||
      Number(editProduct.stock) < 0 ||
      !Number.isInteger(Number(editProduct.stock))
    ) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }

    setEditSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", editProduct.name.trim());
      formData.append("description", editProduct.description?.trim() || "");
      formData.append("category_id", editProduct.category_id);
      formData.append("price", editProduct.price);
      formData.append("discount", editProduct.discount || 0);
      formData.append("stock", editProduct.stock);

      if (editProduct.newImage) formData.append("image", editProduct.newImage);

      const response = await axios.put(
        `${VITE_API_URL}/api/products/${editProduct.id}`,
        formData,
        getAuthConfig(),
      );

      console.log("Product updated:", response.data);
      toast.success("Product updated successfully.");

      setEditProduct(null);
      await fetchProducts(currentPage, search);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product.");
    } finally {
      setEditSaving(false);
    }
  };

  const openDeleteModal = (product) => setDeleteProduct(product);
  const closeDeleteModal = () => setDeleteProduct(null);

  const handleDelete = async () => {
    if (!deleteProduct) return;

    try {
      await axios.delete(
        `${VITE_API_URL}/api/products/${deleteProduct.id}`,
        getAuthConfig(),
      );

      toast.success("Product deleted successfully.");

      const deletedLastItem = products.length === 1 && currentPage > 1;
      const pageToLoad = deletedLastItem ? currentPage - 1 : currentPage;

      setDeleteProduct(null);
      await fetchProducts(pageToLoad, search);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product.");
    }
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  const lowStockCount = products.filter(
    (product) => Number(product.stock) <= 5,
  ).length;

  const discountedCount = products.filter(
    (product) => Number(product.discount) > 0,
  ).length;

  return (
    <div className="admin-products">
      <header className="ap-page-header">
        <div className="ap-heading-copy">
          <span className="ap-eyebrow">
            <FiLayers /> INVENTORY MANAGEMENT
          </span>
          <h1>Products</h1>
          <p>Manage your catalogue, pricing and stock from one place.</p>
        </div>

        <button
          type="button"
          className={`ap-primary-button ${showForm ? "is-open" : ""}`}
          onClick={toggleAddForm}
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Close form" : "Add product"}
        </button>
      </header>

      <section className="ap-summary-grid">
        <article className="ap-summary-card">
          <div className="ap-summary-icon ap-icon-gold">
            <FiPackage />
          </div>
          <div>
            <span>Total products</span>
            <strong>{totalProducts.toLocaleString("en-IN")}</strong>
            <small>Across your catalogue</small>
          </div>
        </article>

        <article className="ap-summary-card">
          <div className="ap-summary-icon ap-icon-green">
            <FiCheckCircle />
          </div>
          <div>
            <span>Categories</span>
            <strong>{categories.length}</strong>
            <small>Available categories</small>
          </div>
        </article>

        <article className="ap-summary-card">
          <div className="ap-summary-icon ap-icon-amber">
            <FiAlertCircle />
          </div>
          <div>
            <span>Low stock on this page</span>
            <strong>{lowStockCount}</strong>
            <small>5 items or fewer</small>
          </div>
        </article>

        <article className="ap-summary-card">
          <div className="ap-summary-icon ap-icon-rose">
            <FiPercent />
          </div>
          <div>
            <span>Discounted on this page</span>
            <strong>{discountedCount}</strong>
            <small>Products currently on offer</small>
          </div>
        </article>
      </section>

      {showForm && (
        <section className="ap-form-card">
          <div className="ap-section-heading">
            <div className="ap-section-heading-icon">
              <FiPlus />
            </div>
            <div>
              <h2>Add a new product</h2>
              <p>Fill in the product information below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ap-form-grid">
              <div className="ap-field ap-field-wide">
                <label htmlFor="add-product-name">
                  Product name <span>*</span>
                </label>
                <input
                  id="add-product-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium storage basket"
                  required
                />
              </div>

              <div className="ap-field ap-field-wide">
                <label htmlFor="add-product-description">Description</label>
                <textarea
                  id="add-product-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the product and its key features..."
                  rows="4"
                />
              </div>

              <div className="ap-field">
                <label htmlFor="add-product-category">
                  Category <span>*</span>
                </label>
                <select
                  id="add-product-category"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ap-field">
                <label htmlFor="add-product-price">
                  Price (₹) <span>*</span>
                </label>
                <div className="ap-input-prefix">
                  <span>₹</span>
                  <input
                    id="add-product-price"
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="ap-field">
                <label htmlFor="add-product-discount">Discount</label>
                <div className="ap-input-suffix">
                  <input
                    id="add-product-discount"
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="ap-field">
                <label htmlFor="add-product-stock">Stock quantity</label>
                <input
                  id="add-product-stock"
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="ap-field ap-field-wide">
                <label htmlFor="add-product-image">Product image</label>
                <label className="ap-file-picker" htmlFor="add-product-image">
                  <span className="ap-file-icon">
                    <FiImage />
                  </span>
                  <span>
                    <strong>
                      {form.image ? form.image.name : "Choose an image"}
                    </strong>
                    <small>
                      {form.image
                        ? "Image selected"
                        : "Click to browse your files"}
                    </small>
                  </span>
                  <span className="ap-file-action">Browse</span>
                </label>
                <input
                  className="ap-file-input"
                  id="add-product-image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="ap-form-footer">
              <p>
                <span>*</span> Required fields
              </p>
              <div className="ap-form-actions">
                <button
                  type="button"
                  className="ap-secondary-button"
                  onClick={closeAddForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <FiRefreshCw className="ap-spinning" />
                  ) : (
                    <FiPlus />
                  )}
                  {saving ? "Adding product..." : "Save product"}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="ap-products-card">
        <div className="ap-list-header">
          <div>
            <span className="ap-eyebrow">YOUR CATALOGUE</span>
            <h2>
              All products{" "}
              <span className="ap-count-pill">{totalProducts}</span>
            </h2>
            <p>View and update your product inventory.</p>
          </div>

          <div className="ap-search-box">
            <FiSearch />
            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={handleClearSearch}
                disabled={loading}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="ap-table-meta">
          <span>
            <FiBox /> {search ? "Search results" : "Product inventory"}
          </span>
          <button
            type="button"
            className="ap-refresh-button"
            onClick={() => fetchProducts(currentPage, search)}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "ap-spinning" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="ap-state-panel">
            <div className="ap-loader" />
            <h3>Loading products</h3>
            <p>Please wait while we retrieve your catalogue.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="ap-state-panel">
            <div className="ap-empty-icon">
              <FiPackage />
            </div>
            <h3>
              {search ? "No matching products" : "Your catalogue is empty"}
            </h3>
            <p>
              {search
                ? `We couldn't find any products matching "${search}".`
                : "Add your first product to start building your catalogue."}
            </p>
            {search ? (
              <button
                type="button"
                className="ap-secondary-button"
                onClick={handleClearSearch}
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                className="ap-primary-button"
                onClick={toggleAddForm}
              >
                <FiPlus /> Add your first product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="ap-table-scroll">
              <table className="ap-products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock status</th>
                    <th>Rating</th>
                    <th className="ap-action-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = Number(product.stock);
                    const lowStock = stock <= 5;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="ap-product-cell">
                            <div className="ap-product-thumbnail">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                />
                              ) : (
                                <FiImage />
                              )}
                            </div>
                            <div className="ap-product-identity">
                              <strong title={product.name}>
                                {product.name}
                              </strong>
                              <span>Product ID: #{product.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="ap-category-tag">
                            <FiTag />
                            {product.category || "Uncategorized"}
                          </span>
                        </td>
                        <td>
                          <strong className="ap-price">
                            {formatPrice(product.price)}
                          </strong>
                        </td>
                        <td>
                          {Number(product.discount) > 0 ? (
                            <span className="ap-discount-tag">
                              {product.discount}% off
                            </span>
                          ) : (
                            <span className="ap-no-discount">—</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`ap-stock-tag ${lowStock ? "is-low" : "is-available"}`}
                          >
                            <span />
                            {lowStock
                              ? stock === 0
                                ? "Out of stock"
                                : "Low stock"
                              : "In stock"}
                            <b>{Number.isFinite(stock) ? stock : 0}</b>
                          </span>
                        </td>
                        <td>
                          <span className="ap-rating">
                            <FiStar />
                            {Number(product.rating || 0).toFixed(1)}
                          </span>
                        </td>
                        <td>
                          <div className="ap-row-actions">
                            <button
                              type="button"
                              className="ap-edit-button"
                              onClick={() => openEditModal(product)}
                              aria-label={`Edit ${product.name}`}
                            >
                              <FiEdit2 /> <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="ap-delete-button"
                              onClick={() => openDeleteModal(product)}
                              aria-label={`Delete ${product.name}`}
                            >
                              <FiTrash2 /> <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="ap-pagination">
                <p>
                  Showing{" "}
                  <strong>{(currentPage - 1) * PRODUCTS_PER_PAGE + 1}</strong>–
                  <strong>
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}
                  </strong>{" "}
                  of <strong>{totalProducts}</strong>
                </p>
                <div className="ap-pagination-controls">
                  <button
                    type="button"
                    className="ap-page-arrow"
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    <FiChevronLeft />
                  </button>
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={`dots-${index}`} className="ap-page-dots">
                        …
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={page}
                        className={`ap-page-number ${page === currentPage ? "is-active" : ""}`}
                        disabled={loading}
                        onClick={() => handlePageChange(page)}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="ap-page-arrow"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}

            {totalProducts > 0 && (
              <div className="ap-pagination-note">
                Page {currentPage} of {totalPages}
                {search && <span> · Filtered by “{search}”</span>}
              </div>
            )}
          </>
        )}
      </section>

      {editProduct && (
        <div className="ap-modal-overlay" onClick={closeEditModal}>
          <section
            className="ap-modal ap-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ap-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ap-modal-header">
              <div className="ap-modal-heading-icon">
                <FiEdit2 />
              </div>
              <div>
                <span className="ap-eyebrow">PRODUCT MANAGEMENT</span>
                <h2 id="ap-edit-title">Edit product</h2>
                <p>
                  Update the details for {editProduct.name || "this product"}.
                </p>
              </div>
              <button
                type="button"
                className="ap-modal-close"
                onClick={closeEditModal}
                disabled={editSaving}
                aria-label="Close edit modal"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="ap-form-grid">
                <div className="ap-field ap-field-wide">
                  <label htmlFor="edit-product-name">
                    Product name <span>*</span>
                  </label>
                  <input
                    id="edit-product-name"
                    type="text"
                    name="name"
                    value={editProduct.name || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="ap-field ap-field-wide">
                  <label htmlFor="edit-product-description">Description</label>
                  <textarea
                    id="edit-product-description"
                    name="description"
                    value={editProduct.description || ""}
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="edit-product-category">
                    Category <span>*</span>
                  </label>
                  <select
                    id="edit-product-category"
                    name="category_id"
                    value={editProduct.category_id || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ap-field">
                  <label htmlFor="edit-product-price">
                    Price (₹) <span>*</span>
                  </label>
                  <div className="ap-input-prefix">
                    <span>₹</span>
                    <input
                      id="edit-product-price"
                      type="number"
                      name="price"
                      value={editProduct.price ?? ""}
                      onChange={handleEditChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="ap-field">
                  <label htmlFor="edit-product-discount">Discount</label>
                  <div className="ap-input-suffix">
                    <input
                      id="edit-product-discount"
                      type="number"
                      name="discount"
                      value={editProduct.discount ?? 0}
                      onChange={handleEditChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                    <span>%</span>
                  </div>
                </div>

                <div className="ap-field">
                  <label htmlFor="edit-product-stock">Stock quantity</label>
                  <input
                    id="edit-product-stock"
                    type="number"
                    name="stock"
                    value={editProduct.stock ?? 0}
                    onChange={handleEditChange}
                    min="0"
                    step="1"
                    required
                  />
                  <small>Use whole numbers for stock quantity.</small>
                </div>

                <div className="ap-field ap-field-wide">
                  <label htmlFor="edit-product-image">
                    Replace product image
                  </label>
                  <label
                    className="ap-file-picker"
                    htmlFor="edit-product-image"
                  >
                    <span className="ap-file-icon">
                      <FiImage />
                    </span>
                    <span>
                      <strong>
                        {editProduct.newImage
                          ? editProduct.newImage.name
                          : "Choose a replacement image"}
                      </strong>
                      <small>
                        {editProduct.newImage
                          ? "New image selected"
                          : "Leave empty to keep the current image"}
                      </small>
                    </span>
                    <span className="ap-file-action">Browse</span>
                  </label>
                  <input
                    className="ap-file-input"
                    id="edit-product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                </div>
              </div>

              <div className="ap-modal-footer">
                <button
                  type="button"
                  className="ap-secondary-button"
                  onClick={closeEditModal}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-primary-button"
                  disabled={editSaving}
                >
                  {editSaving ? (
                    <FiRefreshCw className="ap-spinning" />
                  ) : (
                    <FiCheckCircle />
                  )}
                  {editSaving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteProduct && (
        <div className="ap-modal-overlay" onClick={closeDeleteModal}>
          <section
            className="ap-modal ap-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ap-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ap-delete-icon">
              <FiTrash2 />
            </div>
            <span className="ap-eyebrow">CONFIRM ACTION</span>
            <h2 id="ap-delete-title">Delete this product?</h2>
            <p>
              You are about to delete <strong>{deleteProduct.name}</strong>.
              This action cannot be undone.
            </p>
            <div className="ap-modal-footer ap-delete-footer">
              <button
                type="button"
                className="ap-secondary-button"
                onClick={closeDeleteModal}
              >
                Keep product
              </button>
              <button
                type="button"
                className="ap-danger-button"
                onClick={handleDelete}
              >
                <FiTrash2 /> Delete product
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
