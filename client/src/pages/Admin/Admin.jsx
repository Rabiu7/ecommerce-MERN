import "./Admin.css";

import { useEffect, useState } from "react";

import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
} from "react-icons/fi";

const VITE_API_URL = import.meta.env.VITE_API_URL || 5000;

function Admin() {
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${VITE_API_URL}/api/admin/statistics`);

      if (!response.ok) {
        throw new Error("Failed to load dashboard statistics");
      }

      const data = await response.json();

      console.log("Dashboard statistics:", data);

      setStatistics({
        totalRevenue: Number(data.totalRevenue || 0),
        totalOrders: Number(data.totalOrders || 0),
        totalUsers: Number(data.totalUsers || 0),
        totalProducts: Number(data.totalProducts || 0),
      });
    } catch (error) {
      console.error("Dashboard statistics error:", error);

      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* DASHBOARD HEADER */}

      <div className="dashboard-header">
        <span>ADMIN DASHBOARD</span>

        <h1>Dashboard</h1>

        <p>Welcome back to your HomeNeeds admin panel.</p>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* STATISTICS */}

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <span>Total Revenue</span>

            <h2>
              ₹
              {loading
                ? "0.00"
                : statistics.totalRevenue.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </h2>
          </div>

          <div className="stat-icon">₹</div>
        </div>

        <div className="stat-card">
          <div>
            <span>Total Orders</span>

            <h2>
              {loading ? "0" : statistics.totalOrders.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="stat-icon">
            <FiShoppingBag />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span>Total Customers</span>

            <h2>
              {loading ? "0" : statistics.totalUsers.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="stat-icon">
            <FiUsers />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <span>Total Products</span>

            <h2>
              {loading ? "0" : statistics.totalProducts.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="stat-icon">
            <FiPackage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
