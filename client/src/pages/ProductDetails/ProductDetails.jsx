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
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/products/${id}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();

      setProduct(data);

      const productsResponse = await fetch(`${VITE_API_URL}/api/products`);

      const productsData = await productsResponse.json();

      const related = productsData.filter(
        (item) =>
          Number(item.category_id) === Number(data.category_id) &&
          Number(item.id) !== Number(data.id),
      );

      setRelatedProducts(related);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Unable to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const loadProduct = async () => {
      await fetchProduct();
    };

    loadProduct();
  }, [fetchProduct]);

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
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const buyNow = () => {
    if (!isAuthenticated) {
      toast.info("Please login to continue.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

      return;
    }

    if (!product || product.stock <= 0) {
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

  if (loading) {
    return (
      <section className="product-details-loading">
        <div className="container">
          <h2>Loading product...</h2>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-details-loading">
        <div className="container">
          <h2>Product not found</h2>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="product-details">
        <div className="product-details-container">
          <div className="product-details-grid">
            <div className="product-details-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-details-info">
              <span className="product-details-category">
                {product.category}
              </span>

              <h1>{product.name}</h1>

              <div className="product-details-rating">
                <FaStar />
                <span>{Number(product.rating || 0).toFixed(1)}</span>
              </div>

              <div className="product-details-price">
                ₹{Number(product.price).toFixed(2)}
              </div>

              <p className="product-details-description">
                {product.description}
              </p>

              <div className="stock-status">
                {product.stock > 0 ? (
                  <span className="in-stock">
                    ✓ In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="out-stock">Out of Stock</span>
                )}
              </div>

              {product.stock > 0 && (
                <div className="quantity">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>

                  <span>{quantity}</span>

                  <button
                    onClick={() =>
                      quantity < product.stock && setQuantity(quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              )}

              <div className="actions">
                <button
                  className="cart-btn"
                  onClick={addToCart}
                  disabled={product.stock <= 0}
                >
                  <FiShoppingCart />

                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                <button
                  className="buy-btn"
                  onClick={buyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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

            <div className="related-grid">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  image={item.image}
                  title={item.name}
                  category={item.category}
                  price={item.price}
                  rating={item.rating}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default ProductDetails;
