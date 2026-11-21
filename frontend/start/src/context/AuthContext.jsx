"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import Authservice from "@/services/Authservice";
import authReducer, { initialAuthState } from "@/context/authReducer";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    let isMounted = true;
    dispatch({ type: "AUTH_HYDRATE_PENDING" });
    Authservice.getProfile()
      .then((user) => {
        if (isMounted && user) dispatch({ type: "AUTH_HYDRATE_SUCCESS", payload: user });
      })
      .catch(() => {
        // A missing/expired session is expected for signed-out visitors.
        if (isMounted) dispatch({ type: "AUTH_HYDRATE_REJECTED" });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => dispatch({ type: "AUTH_SESSION_EXPIRED" });
    const handleRefreshStart = () => dispatch({ type: "AUTH_REFRESH_PENDING" });
    const handleRefreshEnd = () => dispatch({ type: "AUTH_REFRESH_COMPLETE" });
    window.addEventListener("auth:session-expired", handleSessionExpired);
    window.addEventListener("auth:refresh-start", handleRefreshStart);
    window.addEventListener("auth:refresh-end", handleRefreshEnd);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
      window.removeEventListener("auth:refresh-start", handleRefreshStart);
      window.removeEventListener("auth:refresh-end", handleRefreshEnd);
    };
  }, []);

  const authenticate = useCallback(async (method, credentials) => {
    dispatch({ type: "AUTH_PENDING" });
    try {
      const result = await Authservice[method](credentials);
      dispatch({ type: "AUTH_SUCCESS", payload: result.user });
      return result;
    } catch (error) {
      dispatch({ type: "AUTH_REJECTED", payload: error.message });
      throw error;
    }
  }, []);

  const signup = useCallback((values) => authenticate("signup", {
    ...values,
    role: values.role || "READER",
  }), [authenticate]);
  const signin = useCallback((values) => authenticate("signin", values), [authenticate]);
  const logout = useCallback(async () => {
    try {
      await Authservice.logout();
    } finally {
      dispatch({ type: "AUTH_RESET" });
    }
  }, []);
  const value = useMemo(
    () => ({ ...state, dispatch, signup, signin, logout }),
    [state, signup, signin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
