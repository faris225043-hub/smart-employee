import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-black mb-4">
        404
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The requested URL was not found in the Smart Employee Management System.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition"
      >
        <Home className="w-4 h-4 mr-2" />
        Return to Dashboard
      </Link>
    </div>
  );
};
