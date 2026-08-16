import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Guards
import { ProtectedRoute, RoleRoute } from './components/common/RouteGuards';

// Public & Landing
import WelcomePage from './pages/WelcomePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

// User Pages
import UserDashboardPage from './pages/user/UserDashboardPage';
import UserMyRatingsPage from './pages/user/UserMyRatingsPage';

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerRatingsPage from './pages/owner/OwnerRatingsPage';

// Shared Pages
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Root route switcher: Shows WelcomePage if unauthenticated, or redirects to role-based dashboard if authenticated
const RootRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (!isAuthenticated) return <WelcomePage />;

  const normRole = (role || '').toLowerCase();
  if (normRole === 'store_owner' || normRole === 'owner') return <Navigate to="/store-owner/dashboard" replace />;
  if (normRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* Root / Landing */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/welcome" element={<WelcomePage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={<AppLayout><AdminDashboardPage /></AppLayout>}
          />
          <Route
            path="/admin/users"
            element={<AppLayout><AdminUsersPage /></AppLayout>}
          />
          <Route
            path="/admin/stores"
            element={<AppLayout><AdminStoresPage /></AppLayout>}
          />
          <Route
            path="/admin/audit-logs"
            element={<AppLayout><AdminAuditLogsPage /></AppLayout>}
          />
        </Route>

        {/* Normal User Routes */}
        <Route element={<RoleRoute allowedRoles={['user']} />}>
          <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
          <Route
            path="/user/dashboard"
            element={<AppLayout><UserDashboardPage /></AppLayout>}
          />
          <Route
            path="/user/ratings"
            element={<AppLayout><UserMyRatingsPage /></AppLayout>}
          />
        </Route>

        {/* Store Owner Routes */}
        <Route element={<RoleRoute allowedRoles={['owner', 'store_owner']} />}>
          <Route path="/store-owner" element={<Navigate to="/store-owner/dashboard" replace />} />
          <Route path="/owner" element={<Navigate to="/store-owner/dashboard" replace />} />
          <Route
            path="/store-owner/dashboard"
            element={<AppLayout><OwnerDashboardPage /></AppLayout>}
          />
          <Route
            path="/store-owner/ratings"
            element={<AppLayout><OwnerRatingsPage /></AppLayout>}
          />
          <Route
            path="/owner/dashboard"
            element={<AppLayout><OwnerDashboardPage /></AppLayout>}
          />
          <Route
            path="/owner/ratings"
            element={<AppLayout><OwnerRatingsPage /></AppLayout>}
          />
        </Route>

        {/* Shared Authenticated Routes */}
        <Route element={<RoleRoute allowedRoles={['admin', 'user', 'owner', 'store_owner']} />}>
          <Route
            path="/profile"
            element={<AppLayout><ProfilePage /></AppLayout>}
          />
        </Route>
      </Route>

      {/* Catch-All 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
