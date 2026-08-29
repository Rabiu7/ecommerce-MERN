import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProducts.css";

import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Product selected for deletion
  const [deleteProduct, setDeleteProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    discount: "0",
    stock: "0",
    image: null,
  });

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/products`);

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);

      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/categories`);

      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);

      toast.error("Failed to load categories.");
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     ADD PRODUCT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("category_id", form.category_id);
      formData.append("price", form.price);
      formData.append("discount", form.discount || 0);
      formData.append("stock", form.stock || 0);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await axios.post(
        `${VITE_API_URL}/api/products`,
        formData,
      );

      console.log("Product created:", response.data);

      toast.success("Product added successfully!");

      setForm({
        name: "",
        description: "",
        category_id: "",
        price: "",
        discount: "0",
        stock: "0",
        image: null,
      });

      setShowForm(false);

      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);

      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     OPEN DELETE MODAL
  ========================================================= */

  const openDeleteModal = (product) => {
    setDeleteProduct(product);
  };

  /* =========================================================
     CLOSE DELETE MODAL
  ========================================================= */

  const closeDeleteModal = () => {
    setDeleteProduct(null);
  };

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  const handleDelete = async () => {
    if (!deleteProduct) {
      return;
    }

    try {
      await axios.delete(`${VITE_API_URL}/api/products/${deleteProduct.id}`);

      setProducts((previous) =>
        previous.filter((product) => product.id !== deleteProduct.id),
      );

      toast.success("Product deleted successfully.");

      setDeleteProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);

      toast.error("Failed to delete product.");
    }
  };

  /* =========================================================
     HANDLE IMAGE
  ========================================================= */

  const handleImageChange = (e) => {
    setForm((previous) => ({
      ...previous,
      image: e.target.files[0] || null,
    }));
  };

  /* =========================================================
     FORMAT PRICE
  ========================================================= */

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="admin-products">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="products-page-header">
        <div>
          <h1>Products</h1>

          <p>Manage your HomeNeeds products and inventory.</p>
        </div>

        <button
          className="add-product-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <span>{showForm ? "×" : "+"}</span>

          {showForm ? "Close" : "Add Product"}
        </button>
      </div>

      {/* =====================================================
          ADD PRODUCT FORM
      ===================================================== */}

      {showForm && (
        <div className="product-form-card">
          <div className="form-card-header">
            <div>
              <h2>Add New Product</h2>

              <p>Enter the details of your new product.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* PRODUCT NAME */}

            <div className="form-group full-width">
              <label>Product Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            <div className="form-grid">
              {/* CATEGORY */}

              <div className="form-group">
                <label>Category</label>

                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PRICE */}

              <div className="form-group">
                <label>Price (₹)</label>

                <div className="price-input">
                  <span>₹</span>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* DISCOUNT */}

              <div className="form-group">
                <label>Discount (%)</label>

                <div className="suffix-input">
                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />

                  <span>%</span>
                </div>
              </div>

              {/* STOCK */}

              <div className="form-group">
                <label>Stock Quantity</label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* IMAGE */}

              <div className="form-group full-width">
                <label>Product Image</label>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {form.image && <small>Selected: {form.image.name}</small>}
              </div>
            </div>

            {/* FORM ACTIONS */}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product-btn"
                disabled={saving}
              >
                {saving ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          PRODUCTS LIST
      ===================================================== */}

      <div className="products-card">
        <div className="products-card-header">
          <div>
            <h2>All Products</h2>

            <span>
              {products.length} product
              {products.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="products-loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <div className="empty-icon">📦</div>

            <h3>No products found</h3>

            <p>Add your first HomeNeeds product.</p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    {/* PRODUCT */}

                    <td>
                      <div className="product-info">
                        <div className="admin-product-image">
                          {product.image ? (
                            <img src={product.image} alt={product.name} />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>

                        <div className="product-name">
                          <strong>{product.name}</strong>

                          <span>ID: #{product.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}

                    <td>
                      <span className="category-badge">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>

                    {/* PRICE */}

                    <td>
                      <strong className="product-price">
                        {formatPrice(product.price)}
                      </strong>
                    </td>

                    {/* DISCOUNT */}

                    <td>
                      {Number(product.discount) > 0 ? (
                        <span className="discount-badge">
                          {product.discount}%
                        </span>
                      ) : (
                        <span className="no-discount">—</span>
                      )}
                    </td>

                    {/* STOCK */}

                    <td>
                      <span
                        className={
                          Number(product.stock) <= 5
                            ? "stock-badge low"
                            : "stock-badge"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* RATING */}

                    <td>
                      <span className="rating">
                        ★ {product.rating || "0.0"}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
                        className="delete-product-btn"
                        onClick={() => openDeleteModal(product)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteProduct && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            {/* WARNING ICON */}

            <div className="delete-modal-icon">
              <span>!</span>
            </div>

            {/* CONTENT */}

            <div className="delete-modal-content">
              <h2>Delete Product?</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteProduct.name}</strong>?
              </p>

              <small>This action cannot be undone.</small>
            </div>

            {/* ACTIONS */}

            <div className="delete-modal-actions">
              <button className="delete-cancel-btn" onClick={closeDeleteModal}>
                Cancel
              </button>

              <button className="delete-confirm-btn" onClick={handleDelete}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
