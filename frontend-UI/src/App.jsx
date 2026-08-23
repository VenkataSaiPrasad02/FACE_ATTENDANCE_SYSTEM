import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Layout from './components/Layout';

import LoginPage from './pages/Login/LoginPage';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import ChangePasswordPage from './pages/Account/ChangePasswordPage';
import ProfilePage from './pages/Account/ProfilePage';
import AdminManagementPage from './pages/AdminManagement/AdminManagementPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import StudentsPage from './pages/Students/StudentsPage';
import TeachersPage from './pages/Teachers/TeachersPage';
import FaceRegistrationPage from './pages/FaceRegistration/FaceRegistrationPage';
import AttendancePage from './pages/Attendance/AttendancePage';
import AttendanceHistoryPage from './pages/AttendanceHistory/AttendanceHistoryPage';
import CalendarPage from './pages/Calendar/CalendarPage';
import AcademicPeriodsPage from './pages/AcademicPeriods/AcademicPeriodsPage';
import {
  NotFoundPage,
  UnauthorizedPage,
  ForbiddenPage,
  ServerErrorPage,
  BadGatewayPage,
  ServiceUnavailablePage,
} from './pages/Errors';
import { PERMISSIONS } from './auth/roles';

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
      <BrowserRouter>
        <Routes>
          {/* =========================
              PUBLIC AUTH ROUTES
              ========================= */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* =========================
              EXPLICIT ERROR PAGES
              ========================= */}
          <Route path="/401" element={<UnauthorizedPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/502" element={<BadGatewayPage />} />
          <Route path="/503" element={<ServiceUnavailablePage />} />

          {/* =========================
              PROTECTED APPLICATION
              ========================= */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Dashboard */}
            <Route
              index
              element={
                <PrivateRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Students */}
            <Route
              path="students"
              element={
                <PrivateRoute permission={PERMISSIONS.MANAGE_STUDENTS}>
                  <StudentsPage />
                </PrivateRoute>
              }
            />

            {/* Teachers */}
            <Route
              path="teachers"
              element={
                <PrivateRoute permission={PERMISSIONS.MANAGE_TEACHERS}>
                  <TeachersPage />
                </PrivateRoute>
              }
            />

            {/* Face Registration */}
            <Route
              path="face-registration"
              element={
                <PrivateRoute permission={PERMISSIONS.MANAGE_FACE_REGISTRATION}>
                  <FaceRegistrationPage />
                </PrivateRoute>
              }
            />

            {/* Attendance */}
            <Route
              path="attendance"
              element={
                <PrivateRoute permission={PERMISSIONS.MANAGE_ATTENDANCE}>
                  <AttendancePage />
                </PrivateRoute>
              }
            />

            {/* Attendance History */}
            <Route
              path="history"
              element={
                <PrivateRoute permission={PERMISSIONS.VIEW_ATTENDANCE_HISTORY}>
                  <AttendanceHistoryPage />
                </PrivateRoute>
              }
            />

            {/* Calendar - ADMIN ONLY */}
            <Route
              path="calendar"
              element={
                <PrivateRoute permission={PERMISSIONS.MANAGE_CALENDAR}>
                  <CalendarPage />
                </PrivateRoute>
              }
            />

            {/* Academic Periods - ADMIN ONLY */}
            <Route
              path="academic-periods"
              element={
                <PrivateRoute permission={PERMISSIONS.MANAGE_ACADEMIC_PERIODS}>
                  <AcademicPeriodsPage />
                </PrivateRoute>
              }
            />

            {/* Account: own profile */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Account security */}
            <Route path="change-password" element={<ChangePasswordPage />} />

            {/* Super Admin only */}
            <Route
              path="admin-management"
              element={
                <PrivateRoute permission={PERMISSIONS.CREATE_ADMIN}>
                  <AdminManagementPage />
                </PrivateRoute>
              }
            />

            {/* 404 inside application shell */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Fallback global 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}