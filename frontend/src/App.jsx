import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketVerificationPage } from './pages/TicketVerificationPage';
import { AboutPage, ContactPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Authenticated User Pages
import { CheckoutPage } from './pages/CheckoutPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { WishlistPage } from './pages/WishlistPage';
import { UserProfilePage } from './pages/UserProfilePage';

// Organizer Pages
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { OrganizerEventsPage } from './pages/organizer/OrganizerEventsPage';
import { CreateEditEventPage } from './pages/organizer/CreateEditEventPage';
import { OrganizerBookingsPage } from './pages/organizer/OrganizerBookingsPage';
import { OrganizerAnalyticsPage } from './pages/organizer/OrganizerAnalyticsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const OrganizerRoute = ({ children }) => {
  const { isAuthenticated, isOrganizer, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (isOrganizer || isAdmin) ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              
              {/* Public & Attendee Routes under MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="events/:slug" element={<EventDetailPage />} />
                <Route path="verify-ticket" element={<TicketVerificationPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />

                {/* Attendee Protected */}
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Organizer Dashboard Routes */}
              <Route
                path="/organizer"
                element={
                  <OrganizerRoute>
                    <DashboardLayout role="organizer" />
                  </OrganizerRoute>
                }
              >
                <Route path="dashboard" element={<OrganizerDashboardPage />} />
                <Route path="events" element={<OrganizerEventsPage />} />
                <Route path="events/create" element={<CreateEditEventPage />} />
                <Route path="events/edit/:id" element={<CreateEditEventPage />} />
                <Route path="bookings" element={<OrganizerBookingsPage />} />
                <Route path="analytics" element={<OrganizerAnalyticsPage />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <DashboardLayout role="admin" />
                  </AdminRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
