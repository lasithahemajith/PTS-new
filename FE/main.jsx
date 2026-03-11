import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    <Toaster position="top-right" />
  </React.StrictMode>
);
