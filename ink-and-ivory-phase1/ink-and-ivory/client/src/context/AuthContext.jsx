import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchCurrentUser, loginRequest, registerRequest, logoutRequest } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await loginRequest(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const newUser = await registerRequest(payload);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isStaff: user?.role === "OWNER" || user?.role === "ADMIN",
    isOwner: user?.role === "OWNER",
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
