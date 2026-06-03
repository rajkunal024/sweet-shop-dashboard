import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserSession = async () => {
    const token = localStorage.getItem("sweet_shop_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await api.get("/auth/me");
      setUser(userData);
      setIsAdmin(userData.role === "admin");
      setSession({ user: userData, token });
    } catch (error) {
      console.error("Failed to restore session:", error);
      localStorage.removeItem("sweet_shop_token");
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  const signUp = async (email, password, fullName, role, adminKey) => {
    try {
      const data = await api.post("/auth/signup", {
        email,
        password,
        fullName,
        role,
        adminKey,
      });
      localStorage.setItem("sweet_shop_token", data.token);
      setUser(data.user);
      setIsAdmin(data.user.role === "admin");
      setSession({ user: data.user, token: data.token });
      return { error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: new Error(error.message || "Signup failed") };
    }
  };

  const signIn = async (email, password) => {
    try {
      const data = await api.post("/auth/login", { email, password });
      localStorage.setItem("sweet_shop_token", data.token);
      setUser(data.user);
      setIsAdmin(data.user.role === "admin");
      setSession({ user: data.user, token: data.token });
      return { error: null };
    } catch (error) {
      console.error("Signin error:", error);
      return { error: new Error(error.message || "Signin failed") };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("sweet_shop_token");
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
