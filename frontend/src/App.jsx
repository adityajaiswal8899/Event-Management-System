import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './AuthContext';
import { NotificationProvider } from './NotificationContext';

// Layouts
import { MainLayout } from './MainLayout';
import { DashboardLayout } from './DashboardLayout';

// Public Pages
import { HomePage } from './HomePage';
import { EventsPage } from './EventsPage';
import { EventDetailPage } from './EventDetailPage';
import { TicketVerificationPage } from './TicketVerificationPage';
import { AboutPage, ContactPage } from './AboutPage';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';

// Authenticated User Pages
import { CheckoutPage } from './CheckoutPage';
import { MyBookingsPage } from './MyBookingsPage';
import { WishlistPage } from './WishlistPage';
import { UserProfilePage } from './UserProfilePage';

// Organizer Pages
import { OrganizerDashboardPage } from './OrganizerDashboardPage';
import { OrganizerEventsPage } from './OrganizerEventsPage';
import { CreateEditEventPage } from './CreateEditEventPage';
import { OrganizerBookingsPage } from './OrganizerBookingsPage';
import { OrganizerAnalyticsPage } from './OrganizerAnalyticsPage';

// Admin Pages
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminEventsPage } from './AdminEventsPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminBookingsPage } from './AdminBookingsPage';
import { AdminPaymentsPage } from './AdminPaymentsPage';
import { AdminCouponsPage } from './AdminCouponsPage';

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
