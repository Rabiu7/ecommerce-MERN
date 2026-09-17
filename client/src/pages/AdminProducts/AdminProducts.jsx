import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./AdminProducts.css";

import { toast } from "react-toastify";

const VITE_API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.2.122:5000";

function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(searchParams.get("add") === "true");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // DELETE
  const [deleteProduct, setDeleteProduct] = useState(null);

  // EDIT
  const [editProduct, setEditProduct] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

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
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);

        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${VITE_API_URL}/api/products`),
          axios.get(`${VITE_API_URL}/api/categories`),
        ]);

        if (!cancelled) {
          setProducts(productsResponse.data);
          setCategories(categoriesResponse.data);
        }
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

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
    }
  };

  /* =========================================================
     HANDLE ADD FORM INPUT
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
        formData
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
      setSearchParams({});

      await fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);

      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (product) => {
    setEditProduct(product);
  };

  /* =========================================================
     CLOSE EDIT MODAL
  ========================================================= */

  const closeEditModal = () => {
    if (editSaving) {
      return;
    }

    setEditProduct(null);
  };

  /* =========================================================
     HANDLE EDIT INPUT
  ========================================================= */

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditProduct((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     HANDLE EDIT IMAGE
  ========================================================= */

  const handleEditImageChange = (e) => {
    setEditProduct((previous) => ({
      ...previous,
      newImage: e.target.files[0] || null,
    }));
  };

  /* =========================================================
     UPDATE PRODUCT
  ========================================================= */

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editProduct) {
      return;
    }

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

      if (editProduct.newImage) {
        formData.append("image", editProduct.newImage);
      }

      const response = await axios.put(
        `${VITE_API_URL}/api/products/${editProduct.id}`,
        formData
      );

      console.log("Product updated:", response.data);

      toast.success("Product updated successfully.");

      setEditProduct(null);

      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);

      toast.error(error.response?.data?.message || "Failed to update product.");
    } finally {
      setEditSaving(false);
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
        previous.filter((product) => product.id !== deleteProduct.id)
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
          onClick={() => {
            const nextValue = !showForm;

            setShowForm(nextValue);

            if (nextValue) {
              setSearchParams({ add: "true" });
            } else {
              setSearchParams({});
            }
          }}
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

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setSearchParams({});
                }}
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

                    <td>
                      <span className="category-badge">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>

                    <td>
                      <strong className="product-price">
                        {formatPrice(product.price)}
                      </strong>
                    </td>

                    <td>
                      {Number(product.discount) > 0 ? (
                        <span className="discount-badge">
                          {product.discount}%
                        </span>
                      ) : (
                        <span className="no-discount">—</span>
                      )}
                    </td>

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

                    <td>
                      <span className="rating">
                        ★ {product.rating || "0.0"}
                      </span>
                    </td>

                    <td>
                      <div className="product-action-buttons">
                        <button
                          type="button"
                          className="edit-product-btn"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-product-btn"
                          onClick={() => openDeleteModal(product)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          EDIT PRODUCT MODAL
      ===================================================== */}

      {editProduct && (
        <div className="edit-modal-overlay" onClick={closeEditModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <div>
                <h2>Edit Product</h2>

                <p>Update product details, price and stock.</p>
              </div>

              <button
                type="button"
                className="edit-modal-close"
                onClick={closeEditModal}
                disabled={editSaving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="edit-form-grid">
                <div className="form-group full-width">
                  <label>Product Name</label>

                  <input
                    type="text"
                    name="name"
                    value={editProduct.name || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={editProduct.description || ""}
                    onChange={handleEditChange}
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <select
                    name="category_id"
                    value={editProduct.category_id || ""}
                    onChange={handleEditChange}
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

                <div className="form-group">
                  <label>Price (₹)</label>

                  <div className="price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="price"
                      value={editProduct.price || ""}
                      onChange={handleEditChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Discount (%)</label>

                  <div className="suffix-input">
                    <input
                      type="number"
                      name="discount"
                      value={editProduct.discount || 0}
                      onChange={handleEditChange}
                      min="0"
                      max="100"
                      step="0.01"
                    />

                    <span>%</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>

                  <input
                    type="number"
                    name="stock"
                    value={editProduct.stock ?? 0}
                    onChange={handleEditChange}
                    min="0"
                    step="1"
                    required
                  />

                  <small>Increase stock when new items arrive.</small>
                </div>

                <div className="form-group full-width">
                  <label>Product Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />

                  {editProduct.newImage && (
                    <small>New image: {editProduct.newImage.name}</small>
                  )}

                  {!editProduct.newImage && editProduct.image && (
                    <small>Current image will be kept.</small>
                  )}
                </div>
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="delete-cancel-btn"
                  onClick={closeEditModal}
                  disabled={editSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-save-btn"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteProduct && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <span>!</span>
            </div>

            <div className="delete-modal-content">
              <h2>Delete Product?</h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteProduct.name}</strong>?
              </p>

              <small>This action cannot be undone.</small>
            </div>

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
