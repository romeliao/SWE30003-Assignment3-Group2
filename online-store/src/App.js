import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navBar";
import ProtectedRoute from "./components/protectedRoute";
import CataloguePage from "./pages/cataloguePage";
import LoginPage from "./pages/loginPage";
import Signup from "./pages/signupPage";
import ForgotPasswordPage from "./pages/forgotPasswordPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import StaffDashboard from "./pages/staffDashboard";
import ManageProducts from "./pages/ManageProducts";
import ManageOrders from "./pages/ManageOrders";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import "./styles.css";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<CataloguePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Staff-only routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/products"
            element={
              <ProtectedRoute allowedRole="staff">
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/orders"
            element={
              <ProtectedRoute allowedRole="staff">
                <ManageOrders />
              </ProtectedRoute>
            }
          />
          
          {/* Customer-only routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRole="customer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="customer">
                <MyOrders />
              </ProtectedRoute>
            }
          />
          
          {/* Protected route for any authenticated user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div style={{ padding: "2rem" }}>
                  <h1>Profile</h1>
                  <p>User profile page (to be implemented)</p>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;