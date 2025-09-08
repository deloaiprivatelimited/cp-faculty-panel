import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode }from "jwt-decode";

const AuthContext = createContext();

const safeGetJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("token") || null,
    admin: safeGetJSON("admin"),
    college: safeGetJSON("college"),
  }));

  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return Boolean(decoded && decoded.exp * 1000 > Date.now());
    } catch {
      return false;
    }
  }, []);

  // Validate token on mount and whenever token changes
  useEffect(() => {
    const token = auth.token;
    if (!token) return;

    if (!isTokenValid(token)) {
      // token invalid or expired -> clear auth and force login
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      localStorage.removeItem("college");
      setAuth({ token: null, admin: null, college: null });
      navigate("/login");
    }
  }, [auth.token, isTokenValid, navigate]);

  /**
   * login(token, admin, college, redirectPath?)
   * - by default it only stores auth
   * - if you pass redirectPath it will navigate there
   */
  const login = (token, admin, college, redirectPath = null) => {
    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(admin));
    localStorage.setItem("college", JSON.stringify(college));
    setAuth({ token, admin, college });

    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("college");
    setAuth({ token: null, admin: null, college: null });
    navigate("/login");
  };

  // markPasswordReset optionally accepts a redirectPath; doesn't assume any default route
  const markPasswordReset = (redirectPath = null) => {
    setAuth((prev) => {
      const newAdmin = { ...(prev?.admin || {}), is_first_login: false };
      localStorage.setItem("admin", JSON.stringify(newAdmin));
      const newState = { ...(prev || {}), admin: newAdmin };

      if (redirectPath) {
        navigate(redirectPath);
      }
      return newState;
    });
  };

 

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isTokenValid,
        markPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
