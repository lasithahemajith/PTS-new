// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AuthContext = createContext();

// Inactivity timeout durations (in milliseconds)
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 5 * 60 * 1000;       // Show warning 5 minutes before logout

// Events that count as user activity
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [warningSecondsRemaining, setWarningSecondsRemaining] = useState(
    WARNING_BEFORE_MS / 1000
  );

  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const logoutCallbackRef = useRef(null);

  // Load auth state from localStorage on first render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken && storedToken !== "undefined") {
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Error loading auth data:", err);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  // Logout
  const logout = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    setShowTimeoutWarning(false);
    setUser(null);
    setToken(null);
    localStorage.clear();
  }, []);

  // Keep logoutCallbackRef in sync so the timer closure always calls the latest logout
  useEffect(() => {
    logoutCallbackRef.current = logout;
  }, [logout]);

  // Reset the inactivity timer on any user activity
  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);
    setShowTimeoutWarning(false);
    setWarningSecondsRemaining(WARNING_BEFORE_MS / 1000);

    // Schedule warning
    inactivityTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      setWarningSecondsRemaining(WARNING_BEFORE_MS / 1000);

      // Schedule actual logout after the warning period
      warningTimerRef.current = setTimeout(() => {
        logoutCallbackRef.current();
      }, WARNING_BEFORE_MS);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);
  }, []);

  // Start/stop inactivity tracking based on auth state
  useEffect(() => {
    if (!token) {
      // Not logged in — clear any existing timers
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      setShowTimeoutWarning(false);
      return;
    }

    // Start tracking immediately on login
    resetInactivityTimer();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer, { passive: true })
    );

    return () => {
      clearTimeout(inactivityTimerRef.current);
      clearTimeout(warningTimerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
    };
  }, [token, resetInactivityTimer]);

  // Mark password as changed (after first-login change)
  const markPasswordChanged = () => {
    const updated = { ...user, mustChangePassword: false };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        markPasswordChanged,
        showTimeoutWarning,
        warningSecondsRemaining,
        dismissTimeoutWarning: resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
