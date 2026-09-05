import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProtectedAdminRoute.css";

function ProtectedAdminRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait until AuthContext restores the user
  if (loading) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-loading-content">
          <div className="admin-loading-logo">H</div>

          <div className="admin-loading-spinner"></div>

          <h2>HomeNeeds</h2>

          <p>Checking your account...</p>
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but not admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;
