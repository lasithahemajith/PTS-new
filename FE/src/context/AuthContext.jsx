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
      const lastActivityTime = localStorage.getItem("lastActivityTime");

      // If a token exists, check whether the inactivity period has already elapsed
      if (storedToken && storedToken !== "undefined" && lastActivityTime) {
        const elapsed = Date.now() - parseInt(lastActivityTime, 10);
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          // Session expired due to inactivity — clear stored data and bail out
          localStorage.clear();
          return;
        }
      }

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
    localStorage.setItem("lastActivityTime", Date.now().toString());
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

    // Persist last activity time so that page refreshes respect the inactivity window
    localStorage.setItem("lastActivityTime", Date.now().toString());

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

    // Calculate remaining idle time, accounting for time already spent since last activity.
    // If lastActivityTime is absent (e.g. existing session before this feature was added),
    // default to now so the user gets a fresh 30-minute window instead of an instant logout.
    const storedLastActivity = localStorage.getItem("lastActivityTime");
    const lastActivityTime = storedLastActivity ? parseInt(storedLastActivity, 10) : Date.now();
    const elapsed = Date.now() - lastActivityTime;
    const remainingTime = INACTIVITY_TIMEOUT_MS - elapsed;

    if (remainingTime <= 0) {
      // Session already expired due to inactivity (e.g. browser was closed and reopened)
      logoutCallbackRef.current();
      return;
    }

    clearTimeout(inactivityTimerRef.current);
    clearTimeout(warningTimerRef.current);

    if (remainingTime <= WARNING_BEFORE_MS) {
      // We are already inside the warning window — show the modal immediately
      setShowTimeoutWarning(true);
      setWarningSecondsRemaining(Math.floor(remainingTime / 1000));
      warningTimerRef.current = setTimeout(() => {
        logoutCallbackRef.current();
      }, remainingTime);
    } else {
      // Schedule the warning at the appropriate point in the future
      inactivityTimerRef.current = setTimeout(() => {
        setShowTimeoutWarning(true);
        setWarningSecondsRemaining(WARNING_BEFORE_MS / 1000);
        warningTimerRef.current = setTimeout(() => {
          logoutCallbackRef.current();
        }, WARNING_BEFORE_MS);
      }, remainingTime - WARNING_BEFORE_MS);
    }

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
