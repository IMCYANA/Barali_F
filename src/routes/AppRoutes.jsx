// rafce
import { Routes, Route, Navigate } from "react-router-dom"

// Layouts
import MainLayout from "../layouts/main/MainLayout"
import AdminLayout from "../layouts/admin/AdminLayout"
import AuthLayout from "../layouts/auth/AuthLayout"

// Main Routes
import HomePage from "../pages/main/home/HomePage"
import LoginPage from "../pages/main/auth/LoginPage"
import SearchPage from "../pages/main/search/SearchPage"
import BookingPage from "../pages/main/booking/BookingPage"
import BookingConfirmation from "../pages/main/booking/BookingConfirmation"
import BookingList from "../pages/main/booking/BookingList"

// Admin Routes
import DashboardPage from "../pages/admin/dashboard/DashboardPage"

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="search-results" element={<SearchPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="booking-list" element={<BookingList />} />
        <Route path="booking-confirmation" element={<BookingConfirmation />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route path="admin/*" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
export default AppRoutes