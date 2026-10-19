import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiUpload,
  FiImage,
  FiLayers,
  FiPackage,
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import "./AdminCategories.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const initialForm = {
  name: "",
  description: "",
};

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/categories`);
      const categoryData = Array.isArray(response.data)
        ? response.data
        : response.data?.categories || [];

      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = categories.filter((category) => {
      const name = category.name || "";
      const description = category.description || "";

      return (
        name.toLowerCase().includes(search) ||
        description.toLowerCase().includes(search)
      );
    });

    setFilteredCategories(result);
  }, [categories, searchTerm]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    setImageFile(null);
    setImagePreview(category.image || "");
    setIsModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      toast.error("Please enter a category name.");
      return;
    }

    if (!editingId && !imageFile) {
      toast.error("Please upload a category image.");
      return;
    }

    const payload = new FormData();
    payload.append("name", name);
    payload.append("description", description);

    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      setSaving(true);

      if (editingId) {
        await axios.put(
          `${API_URL}/api/categories/${editingId}`,
          payload,
          getAuthConfig(),
        );
        toast.success("Category updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/categories`, payload, getAuthConfig());
        toast.success("Category created successfully.");
      }

      setIsModalOpen(false);
      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);

      toast.error(
        error.response?.data?.message || "Unable to save the category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);

      await axios.delete(
        `${API_URL}/api/categories/${category.id}`,
        getAuthConfig(),
      );

      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id),
      );

      toast.success("Category deleted successfully.");
    } catch (error) {
      console.error("Failed to delete category:", error);

      toast.error(
        error.response?.data?.message || "Unable to delete this category.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-categories-page">
      <div className="ac-page-header">
        <div className="ac-heading-copy">
          <span className="ac-eyebrow">CATALOG MANAGEMENT</span>
          <h1>Categories</h1>
          <p>Organise your products and keep your store easy to explore.</p>
        </div>

        <button
          type="button"
          className="ac-primary-button"
          onClick={openAddModal}
        >
          <FiPlus />
          <span>Add category</span>
        </button>
      </div>

      <div className="ac-overview-grid">
        <div className="ac-overview-card">
          <div className="ac-overview-icon ac-icon-gold">
            <FiLayers />
          </div>
          <div className="ac-overview-details">
            <span>Total categories</span>
            <strong>{categories.length}</strong>
            <small>Categories in your store</small>
          </div>
        </div>

        <div className="ac-overview-card">
          <div className="ac-overview-icon ac-icon-cream">
            <FiPackage />
          </div>
          <div className="ac-overview-details">
            <span>Products organised</span>
            <strong>
              {categories.reduce(
                (total, category) =>
                  total + Number(category.product_count || 0),
                0,
              )}
            </strong>
            <small>Across all categories</small>
          </div>
        </div>

        <div className="ac-overview-card">
          <div className="ac-overview-icon ac-icon-soft">
            <FiImage />
          </div>
          <div className="ac-overview-details">
            <span>Search results</span>
            <strong>{filteredCategories.length}</strong>
            <small>
              {searchTerm.trim()
                ? "Matching your search"
                : "All categories displayed"}
            </small>
          </div>
        </div>
      </div>

      <section className="ac-content-panel">
        <div className="ac-toolbar">
          <div className="ac-toolbar-heading">
            <h2>All categories</h2>
            <span className="ac-count-badge">{categories.length}</span>
          </div>

          <div className="ac-toolbar-actions">
            <label className="ac-search-box">
              <FiSearch />
              <input
                type="search"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="ac-clear-search"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                >
                  <FiX />
                </button>
              )}
            </label>

            <button
              type="button"
              className="ac-refresh-button"
              onClick={fetchCategories}
              disabled={loading}
              title="Refresh categories"
              aria-label="Refresh categories"
            >
              <FiRefreshCw className={loading ? "ac-spinning" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ac-state-panel">
            <div className="ac-loader" />
            <h3>Loading categories</h3>
            <p>Please wait while we fetch your categories.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="ac-state-panel">
            <div className="ac-empty-icon">
              {searchTerm ? <FiSearch /> : <FiLayers />}
            </div>
            <h3>
              {searchTerm ? "No matching categories" : "No categories yet"}
            </h3>
            <p>
              {searchTerm
                ? "Try another search term or clear your search."
                : "Create your first category to start organising products."}
            </p>

            {searchTerm ? (
              <button
                type="button"
                className="ac-secondary-button"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                className="ac-primary-button"
                onClick={openAddModal}
              >
                <FiPlus />
                Add your first category
              </button>
            )}
          </div>
        ) : (
          <div className="ac-table-wrapper">
            <table className="ac-table">
              <thead>
                <tr>
                  <th className="ac-category-column">Category</th>
                  <th>Description</th>
                  <th className="ac-products-column">Products</th>
                  <th className="ac-date-column">Created</th>
                  <th className="ac-actions-column">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="ac-category-cell">
                        <div className="ac-category-image">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name || "Category"}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <FiImage />
                          )}
                        </div>

                        <div className="ac-category-info">
                          <strong>
                            {category.name || "Untitled category"}
                          </strong>
                          <span>ID: {category.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <p className="ac-description-cell">
                        {category.description?.trim() || "No description added"}
                      </p>
                    </td>

                    <td>
                      <span className="ac-product-count">
                        <FiPackage />
                        {Number(category.product_count || 0)}
                      </span>
                    </td>

                    <td>
                      <span className="ac-date-cell">
                        <FiCalendar />
                        {formatDate(category.created_at)}
                      </span>
                    </td>

                    <td>
                      <div className="ac-row-actions">
                        <button
                          type="button"
                          className="ac-action-button ac-edit-button"
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                          aria-label={`Edit ${category.name}`}
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          className="ac-action-button ac-delete-button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id}
                          title="Delete category"
                          aria-label={`Delete ${category.name}`}
                        >
                          {deletingId === category.id ? (
                            <span className="ac-button-loader" />
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredCategories.length > 0 && (
          <div className="ac-table-footer">
            <span>
              Showing <strong>{filteredCategories.length}</strong> of{" "}
              <strong>{categories.length}</strong> categories
            </span>
            <span className="ac-footer-note">
              <span className="ac-status-dot" />
              Category data is up to date
            </span>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div
          className="ac-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="ac-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ac-modal-title"
          >
            <div className="ac-modal-header">
              <div>
                <span className="ac-eyebrow">
                  {editingId ? "UPDATE YOUR CATALOG" : "GROW YOUR CATALOG"}
                </span>
                <h2 id="ac-modal-title">
                  {editingId ? "Edit category" : "Add a category"}
                </h2>
                <p>
                  {editingId
                    ? "Update the category details below."
                    : "Add a name, description and image for your new category."}
                </p>
              </div>

              <button
                type="button"
                className="ac-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            <form className="ac-category-form" onSubmit={handleSubmit}>
              <div className="ac-form-field">
                <label htmlFor="ac-category-name">
                  Category name <span>*</span>
                </label>
                <input
                  id="ac-category-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Home Decor"
                  maxLength={100}
                  required
                  autoFocus
                />
              </div>

              <div className="ac-form-field">
                <label htmlFor="ac-category-description">Description</label>
                <textarea
                  id="ac-category-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe this category..."
                  rows={4}
                  maxLength={1000}
                />
                <span className="ac-character-count">
                  {formData.description.length}/1000
                </span>
              </div>

              <div className="ac-form-field">
                <label>Category image {!editingId && <span>*</span>}</label>

                <label className="ac-image-upload" htmlFor="ac-category-image">
                  {imagePreview ? (
                    <div className="ac-image-preview">
                      <img src={imagePreview} alt="Category preview" />
                      <div className="ac-image-overlay">
                        <FiUpload />
                        <span>Change image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="ac-upload-placeholder">
                      <div className="ac-upload-icon">
                        <FiUpload />
                      </div>
                      <strong>Click to upload an image</strong>
                      <span>PNG, JPG, WEBP · Maximum 5 MB</span>
                    </div>
                  )}

                  <input
                    id="ac-category-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>

                {editingId && (
                  <p className="ac-image-help">
                    Leave the image unchanged to keep the current image.
                  </p>
                )}
              </div>

              <div className="ac-modal-actions">
                <button
                  type="button"
                  className="ac-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ac-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="ac-button-loader ac-button-loader-light" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingId ? <FiEdit2 /> : <FiPlus />}
                      {editingId ? "Save changes" : "Create category"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
