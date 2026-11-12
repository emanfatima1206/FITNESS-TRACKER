import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login on startup or whenever refreshed by pinging /auth/profile with credentials
  const checkUser = useCallback(async () => {
    try {
      const data = await authApi.getProfile();
      if (data && (data._id || data.id || data.email)) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Handle back-forward cache (bfcache) navigation
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        checkUser();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [checkUser]);

  // Login function
  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data && data.user) {
      setUser(data.user);
      return data;
    } else {
      throw new Error(data?.message || "Login failed");
    }
  };

  // Register function
  const register = async (userData) => {
    const data = await authApi.register(userData);
    if (data && data.user) {
      setUser(data.user);
      return data;
    } else {
      throw new Error(data?.message || "Registration failed");
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setUser(null);
    localStorage.removeItem("token");
    sessionStorage.clear();
  };

  // Update profile in local state
  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
