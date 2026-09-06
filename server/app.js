const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: [
    "http://10.211.252.133:5173",
    "https://ecommerce-mern-hazel.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const CartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// Auth API
app.use("/api/auth", authRoutes);

// Product API
app.use("/api/products", productRoutes);

// Category API
app.use("/api/categories", categoryRoutes);

// Cart API
app.use("/api/cart", CartRoutes);

// Cart API
app.use("/api/reviews", reviewRoutes);

// Profile API
app.use("/api/profile", profileRoutes);

app.use("/api/addresses", addressRoutes);

// Order API
app.use("/api/orders", orderRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/admin/orders", adminOrderRoutes);

// Admin API
app.use("/api/admin", adminRoutes);

app.use("/api/admin/customers", adminCustomerRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Home Needs Store API Running 🚀",
  });
});

// Routes AFTER CORS
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);

// Server
const PORT = process.env.PORT || 5000;

const cloudinary = require("./config/cloudinary");

console.log("Cloudinary configured:", !!cloudinary.config().cloud_name);

console.log("Cashfree App ID:", process.env.CASHFREE_APP_ID);
console.log("Cashfree Secret exists:", !!process.env.CASHFREE_SECRET_KEY);
console.log("Cashfree Environment:", process.env.CASHFREE_ENV);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
