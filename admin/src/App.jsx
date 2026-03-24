import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom';

// Admin Components
import AdminNavbar from './components/AdminNavbar';
import AdminSidebar from './components/AdminSidebar';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Users from './pages/Users';
import AddUser from './pages/AddUser'; 
import UserDetails from './pages/UserDetails';
import Settings from './pages/Settings';

import './App.scss';

// Auth check
const isAuthenticated = () => {
  return localStorage.getItem('adminToken') !== null;
};

// Protected Route avec Navbar et Sidebar
const ProtectedLayout = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="admin-app">
      <AdminSidebar />
      <div className="admin-wrapper">
        <AdminNavbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/admin/login" 
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedLayout />}>
          {/* Redirection par défaut */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          
          
          {/* Products */}
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/products/new" element={<ProductForm mode="create" />} />
          <Route path="/admin/products/add" element={<ProductForm mode="create" />} />
          <Route path="/admin/products/edit/:id" element={<ProductForm mode="edit" />} />
          
          {/* Orders */}
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/orders/:id" element={<OrderDetails />} />
          
          {/* Users */}
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/AddUser" element={<AddUser />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          
          {/* Settings */}
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={
          <div className="error-404">
            <h1>404</h1>
            <p>Page not found</p>
            <a href="/admin/dashboard">Go to Dashboard</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;