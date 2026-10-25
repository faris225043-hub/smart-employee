import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating session..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">403</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-600 max-w-md">
          Your current role (<span className="font-semibold text-slate-800">{user.role}</span>) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
