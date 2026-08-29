import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import { toast } from "react-toastify";

import "./AdminCategories.css";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${VITE_API_URL}/api/categories`);

      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);

      toast.error(
        error.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================================================
     HANDLE TEXT INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     HANDLE IMAGE
  ========================================================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");

      e.target.value = "";
      return;
    }

    // Validate image size - 5 MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");

      e.target.value = "";
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  /* =========================================================
     ADD CATEGORY
  ========================================================= */

  const handleAdd = () => {
    setEditingId(null);

    setForm({
      name: "",
      description: "",
      image: null,
    });

    setImagePreview("");

    setShowForm(true);
  };

  /* =========================================================
     EDIT CATEGORY
  ========================================================= */

  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      image: null,
    });

    // Show existing Cloudinary image
    setImagePreview(category.image || "");

    setShowForm(true);
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const handleCloseForm = () => {
    setShowForm(false);

    setEditingId(null);

    setForm({
      name: "",
      description: "",
      image: null,
    });

    setImagePreview("");
  };

  /* =========================================================
     SUBMIT CATEGORY
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter category name.");
      return;
    }

    // Image required only when creating
    if (!editingId && !form.image) {
      toast.error("Please select a category image.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());

      formData.append("description", form.description.trim());

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {
        // UPDATE
        const response = await axios.put(
          `${VITE_API_URL}/api/categories/${editingId}`,
          formData,
        );

        console.log("Category updated:", response.data);

        toast.success("Category updated successfully!");
      } else {
        // CREATE
        const response = await axios.post(
          `${VITE_API_URL}/api/categories`,
          formData,
        );

        console.log("Category created:", response.data);

        toast.success("Category created successfully!");
      }

      handleCloseForm();

      fetchCategories();
    } catch (error) {
      console.error("Category save error:", error);

      toast.error(error.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE CATEGORY
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${VITE_API_URL}/api/categories/${id}`);

      setCategories((previous) =>
        previous.filter((category) => category.id !== id),
      );

      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Error deleting category:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete category.",
      );
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(search.toLowerCase()) ||
      category.description?.toLowerCase().includes(search.toLowerCase()),
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="admin-categories">
      {/* HEADER */}

      <div className="categories-header">
        <div>
          <h1>Categories</h1>

          <p>Manage your HomeNeeds product categories.</p>
        </div>

        <button className="add-category-btn" onClick={handleAdd}>
          <FiPlus />
          Add Category
        </button>
      </div>

      {/* SEARCH */}

      <div className="categories-toolbar">
        <div className="category-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <FiX />
            </button>
          )}
        </div>

        <div className="category-count">
          {filteredCategories.length}{" "}
          {filteredCategories.length === 1 ? "category" : "categories"}
        </div>
      </div>

      {/* TABLE */}

      <div className="categories-table-container">
        {loading ? (
          <div className="categories-loading">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="categories-empty">
            <FiImage />

            <h3>No categories found</h3>

            <p>Add your first HomeNeeds category.</p>

            <button className="add-category-btn" onClick={handleAdd}>
              <FiPlus />
              Add Category
            </button>
          </div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category</th>
                <th>Description</th>
                <th>Products</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  {/* IMAGE */}

                  <td>
                    <div className="category-image">
                      {category.image ? (
                        <img src={category.image} alt={category.name} />
                      ) : (
                        <span>{category.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </td>

                  {/* NAME */}

                  <td>
                    <strong>{category.name}</strong>
                  </td>

                  {/* DESCRIPTION */}

                  <td>
                    <span className="category-description">
                      {category.description || "No description"}
                    </span>
                  </td>

                  {/* PRODUCT COUNT */}

                  <td>
                    <span className="product-count">
                      {category.product_count || 0}
                    </span>
                  </td>

                  {/* CREATED */}

                  <td>
                    {category.created_at
                      ? new Date(category.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* ACTIONS */}

                  <td>
                    <div className="category-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(category)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(category.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =====================================================
          CATEGORY FORM MODAL
      ===================================================== */}

      {showForm && (
        <div className="category-modal-overlay" onClick={handleCloseForm}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}

            <div className="category-modal-header">
              <div>
                <h2>{editingId ? "Edit Category" : "Add Category"}</h2>

                <p>
                  {editingId
                    ? "Update category details."
                    : "Create a new product category."}
                </p>
              </div>

              <button onClick={handleCloseForm}>
                <FiX />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="category-form">
              {/* NAME */}

              <div className="form-group">
                <label>Category Name</label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Customized Gifts"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter category description"
                  rows="4"
                />
              </div>

              {/* IMAGE */}

              <div className="form-group">
                <label>Category Image</label>

                <label className="category-upload-box">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="category-image-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <FiUpload />

                      <strong>Click to upload image</strong>

                      <span>PNG, JPG, JPEG or WEBP</span>
                    </div>
                  )}
                </label>

                {form.image && (
                  <small className="selected-image-name">
                    Selected: {form.image.name}
                  </small>
                )}
              </div>

              {/* ACTIONS */}

              <div className="category-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-category-btn"
                  disabled={saving}
                >
                  {saving
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
