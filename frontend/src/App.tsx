import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/Login';
import OrdersPage from './pages/Orders';
import UsersPage from './pages/Users';
import Container from './components/Container';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace />;
};

const Layout: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { logout, isAdmin } = useAuth();
  return (
    <div className="p-4">
      <nav className="mb-4 flex items-center gap-x-6">
        <Link className="text-blue-700 font-medium hover:text-blue-900" to="/">Orders</Link>
        {isAdmin && <Link className="text-blue-700 font-medium hover:text-blue-900" to="/users">Users</Link>}
        <button className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={logout}>Logout</button>
      </nav>
      <Container>{children}</Container>
    </div>
  );
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/users"
      element={
        <PrivateRoute>
          <AdminRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </AdminRoute>
        </PrivateRoute>
      }
    />
    <Route
      path="/"
      element={
        <PrivateRoute>
          <Layout>
            <OrdersPage />
          </Layout>
        </PrivateRoute>
      }
    />
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
    <Toaster position="top-right" />
  </AuthProvider>
);

export default App; 