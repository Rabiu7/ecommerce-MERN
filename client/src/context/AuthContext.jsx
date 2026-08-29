import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     RESTORE LOGIN
  ========================================================= */

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          return;
        }

        let userData;

        // Parse user safely
        try {
          userData = JSON.parse(savedUser);
        } catch (error) {
          console.error("Invalid saved user JSON:", error);

          localStorage.removeItem("user");
          localStorage.removeItem("token");

          setUser(null);

          return;
        }

        // Validate user object
        if (!userData || typeof userData !== "object" || !userData.id) {
          console.error("Invalid saved user data");

          localStorage.removeItem("user");
          localStorage.removeItem("token");

          setUser(null);

          return;
        }

        // Restore login FIRST
        setUser(userData);

        // Cart failure should NOT logout user
        await fetchCartCount(userData.id);
      } catch (error) {
        console.error("Failed to restore user:", error);

        // IMPORTANT:
        // Do NOT remove user/token here.
        // A backend/cart failure should not logout the user.
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */

  const login = async (userData, token) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));

      if (token) {
        localStorage.setItem("token", token);
      }

      setUser(userData);

      if (userData?.id) {
        await fetchCartCount(userData.id);
      }
    } catch (error) {
      console.error("Login state error:", error);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setCartCount(0);
  };

  /* =========================================================
     FETCH CART COUNT
  ========================================================= */

  const fetchCartCount = async (userId) => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`${VITE_API_URL}/api/cart/${userId}`);

      if (!response.ok) {
        console.error("Cart API error:", response.status, response.statusText);

        setCartCount(0);
        return;
      }

      const data = await response.json();

      const total = Array.isArray(data)
        ? data.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : 0;

      setCartCount(total);
    } catch (error) {
      console.error("Cart count error:", error);

      // Cart unavailable ≠ user logged out
      setCartCount(0);
    }
  };

  /* =========================================================
     CONTEXT
  ========================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        cartCount,
        fetchCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   USE AUTH
========================================================= */

export function useAuth() {
  return useContext(AuthContext);
}
