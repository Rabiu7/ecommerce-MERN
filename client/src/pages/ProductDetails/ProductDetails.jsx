import "./ProductDetails.css";

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FaStar } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";

import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

import ProductCard from "../../components/ProductCard/ProductCard";

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ProductDetails() {
  const { publicId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedPagination, setRelatedPagination] = useState(null);

  // =========================================================
  // PRODUCT SEO
  // =========================================================

  useEffect(() => {
    if (!product || !publicId) {
      return;
    }

    const productUrl = `https://www.mashaallahcreations.in/products/${publicId}`;

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",

      name: product.name,

      description: product.description || "",

      image: product.image ? [product.image] : [],

      url: productUrl,

      brand: {
        "@type": "Brand",
        name: "Masha Allah Creations",
      },

      offers: {
        "@type": "Offer",

        url: productUrl,

        priceCurrency: "INR",

        price: Number(product.price).toFixed(2),

        availability:
          Number(product.stock) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        seller: {
          "@type": "Organization",
          name: "Masha Allah Creations",
        },
      },
    };

    const existingSchema = document.getElementById("product-schema");

    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement("script");

    script.id = "product-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(productSchema);

    document.head.appendChild(script);

    return () => {
      const schema = document.getElementById("product-schema");

      if (schema) {
        schema.remove();
      }
    };
  }, [product, publicId]);

  // =========================================================
  // BREADCRUMB SEO
  // =========================================================

  useEffect(() => {
    if (!product || !publicId) {
      return;
    }

    const productUrl = `https://www.mashaallahcreations.in/products/${publicId}`;

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",

      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.mashaallahcreations.in/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: "https://www.mashaallahcreations.in/products",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: productUrl,
        },
      ],
    };

    const existingSchema = document.getElementById("breadcrumb-schema");

    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement("script");

    script.id = "breadcrumb-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(breadcrumbSchema);

    document.head.appendChild(script);

    return () => {
      const schema = document.getElementById("breadcrumb-schema");

      if (schema) {
        schema.remove();
      }
    };
  }, [product, publicId]);

  // =========================================================
  // STOCK REMINDER STATES
  // =========================================================

  const [isReminderSet, setIsReminderSet] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${VITE_API_URL}/api/products/${publicId}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();

      console.log("Product data:", data);

      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);

      setProduct(null);

      toast.error("Unable to load product");
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  // =========================================================
  // FETCH RELATED PRODUCTS
  // =========================================================

  const fetchRelatedProducts = useCallback(async () => {
    try {
      const response = await fetch(
        `${VITE_API_URL}/api/products/${publicId}/related?page=${relatedPage}&limit=4`,
      );

      if (!response.ok) {
        throw new Error("Unable to load related products");
      }

      const data = await response.json();

      console.log("Related products response:", data);

      setRelatedProducts(data.products || []);

      setRelatedPagination(data.pagination || null);
    } catch (error) {
      console.error("Error loading related products:", error);

      setRelatedProducts([]);
      setRelatedPagination(null);
    }
  }, [publicId, relatedPage]);

  // =========================================================
  // LOAD PRODUCT
  // =========================================================

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // =========================================================
  // LOAD RELATED PRODUCTS
  // =========================================================

  useEffect(() => {
    if (publicId) {
      fetchRelatedProducts();
    }
  }, [fetchRelatedProducts, publicId]);

  // =========================================================
  // RESET RELATED PAGE WHEN PRODUCT CHANGES
  // =========================================================

  useEffect(() => {
    setRelatedPage(1);
  }, [publicId]);

  // =========================================================
  // CHECK WHETHER USER ALREADY SUBSCRIBED FOR STOCK REMINDER
  // =========================================================

  useEffect(() => {
    const checkReminder = async () => {
      // No need to check if:
      // - user is not logged in
      // - user doesn't exist
      // - product doesn't exist
      // - product is already in stock

      if (
        !isAuthenticated ||
        !user?.id ||
        !product?.id ||
        Number(product.stock) > 0
      ) {
        setIsReminderSet(false);
        return;
      }

      try {
        const response = await fetch(
          `${VITE_API_URL}/api/stock-reminders/${user.id}/${product.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setIsReminderSet(Boolean(data.subscribed));
      } catch (error) {
        console.error("Check stock reminder error:", error);
      }
    };

    checkReminder();
  }, [user?.id, isAuthenticated, product?.id, product?.stock]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to add products to cart.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    try {
      const response = await fetch(`${VITE_API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Product added to cart 🛒");
      } else {
        toast.error(data.message || "Unable to add product");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong");
    }
  };

  // =========================================================
  // BUY NOW
  // =========================================================

  const buyNow = () => {
    if (!isAuthenticated) {
      toast.info("Please login to continue.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    if (!product || Number(product.stock) <= 0) {
      toast.error("Product is out of stock.");
      return;
    }

    const buyNowItem = {
      product_id: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity,
      stock: product.stock,
    };

    navigate("/checkout", {
      state: {
        buyNow: true,
        cartItems: [buyNowItem],
      },
    });
  };

  // =========================================================
  // SET / CANCEL STOCK REMINDER
  // =========================================================

  const handleRemindMe = async () => {
    // User must be logged in
    if (!isAuthenticated) {
      toast.info("Please login to get notified.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    // Prevent multiple clicks
    if (reminderLoading) {
      return;
    }

    try {
      setReminderLoading(true);

      // =====================================================
      // CANCEL EXISTING REMINDER
      // =====================================================

      if (isReminderSet) {
        const response = await fetch(
          `${VITE_API_URL}/api/stock-reminders/${user.id}/${product.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          setIsReminderSet(false);

          toast.success(data.message || "Stock reminder cancelled.");
        } else {
          toast.error(data.message || "Unable to cancel reminder.");
        }

        return;
      }

      // =====================================================
      // SET NEW REMINDER
      // =====================================================

      const response = await fetch(`${VITE_API_URL}/api/stock-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: product.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsReminderSet(true);

        toast.success(
          data.message || "You are subscribed for stock notification.",
        );
      } else {
        toast.error(data.message || "Unable to set reminder.");
      }
    } catch (error) {
      console.error("Stock reminder error:", error);

      toast.error("Unable to update stock reminder.");
    } finally {
      setReminderLoading(false);
    }
  };

  // =========================================================
  // RELATED PRODUCT PAGINATION
  // =========================================================

  const previousRelatedPage = () => {
    if (relatedPagination?.hasPreviousPage) {
      setRelatedPage((previousPage) => previousPage - 1);
    }
  };

  const nextRelatedPage = () => {
    if (relatedPagination?.hasNextPage) {
      setRelatedPage((previousPage) => previousPage + 1);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="product-details-loading">
        <div className="container">
          <h2>Loading product...</h2>
        </div>
      </section>
    );
  }

  // =========================================================
  // PRODUCT NOT FOUND
  // =========================================================

  if (!product) {
    return (
      <section className="product-details-loading">
        <div className="container">
          <h2>Product not found</h2>
        </div>
      </section>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <section className="product-details">
        <div className="product-details-container">
          <div className="product-details-grid">
            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <div className="product-details-image">
              <img src={product.image} alt={product.name} />
            </div>

            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="product-details-info">
              {/* CATEGORY */}

              <span className="product-details-category">
                {product.category}
              </span>

              {/* PRODUCT NAME */}

              <h1>{product.name}</h1>

              {/* RATING */}

              <div className="product-details-rating">
                <FaStar />

                <span>{Number(product.rating || 0).toFixed(1)}</span>
              </div>

              {/* PRICE */}

              <div className="product-details-price">
                ₹{Number(product.price).toFixed(2)}
              </div>

              {/* DESCRIPTION */}

              <p className="product-details-description">
                {product.description}
              </p>

              {/* =================================================
                  STOCK STATUS
              ================================================= */}

              <div className="stock-status">
                {Number(product.stock) > 0 ? (
                  <span className="in-stock">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <div className="out-stock-wrapper">
                    <span className="out-stock">Out of Stock</span>

                    <button
                      type="button"
                      className={`remind-btn ${
                        isReminderSet ? "reminder-set" : ""
                      }`}
                      onClick={handleRemindMe}
                      disabled={reminderLoading}
                    >
                      {reminderLoading
                        ? "Please wait..."
                        : isReminderSet
                          ? "✓ You're on the list"
                          : "Remind Me"}
                    </button>
                  </div>
                )}
              </div>

              {/* =================================================
                  QUANTITY
              ================================================= */}

              {Number(product.stock) > 0 && (
                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      quantity < Number(product.stock) &&
                      setQuantity(quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              )}

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="actions">
                {Number(product.stock) > 0 && (
                  <>
                    <button
                      type="button"
                      className="cart-btn"
                      onClick={addToCart}
                    >
                      <FiShoppingCart />
                      Add to Cart
                    </button>

                    <button type="button" className="buy-btn" onClick={buyNow}>
                      Buy Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          RELATED PRODUCTS
      ======================================================= */}

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="related-products-container">
            <div className="related-header">
              <div>
                <span className="related-label">YOU MAY ALSO LIKE</span>

                <h2>Related Products</h2>

                <p>Discover more products from this category.</p>
              </div>
            </div>

            {/* =====================================================
                RELATED PRODUCTS
            ===================================================== */}

            <div className="related-grid">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  publicId={item.public_id}
                  image={item.image}
                  title={item.name}
                  category={item.category}
                  price={item.price}
                  rating={item.rating}
                  stock={item.stock}
                />
              ))}
            </div>

            {/* =====================================================
                PAGINATION
            ===================================================== */}

            {relatedPagination && relatedPagination.totalPages > 1 && (
              <div className="related-pagination">
                <button
                  type="button"
                  onClick={previousRelatedPage}
                  disabled={!relatedPagination.hasPreviousPage}
                >
                  Previous
                </button>

                <span>
                  Page {relatedPagination.currentPage} of{" "}
                  {relatedPagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={nextRelatedPage}
                  disabled={!relatedPagination.hasNextPage}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

export default ProductDetails;
