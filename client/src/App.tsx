import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailsPage } from './pages/EmployeeDetailsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Workspace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
