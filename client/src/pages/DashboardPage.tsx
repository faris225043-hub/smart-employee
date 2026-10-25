import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { DashboardSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Users,
  UserCheck,
  UserX,
  CalendarRange,
  DollarSign,
  Building,
  Briefcase,
  ArrowRight,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasRole } = useAuth();

  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching live analytics from MongoDB..." fullPage />;
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-rose-800">Dashboard Unavailable</h3>
        <p className="mt-1 text-sm text-rose-600">{error || 'Unable to load metrics.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { counts, departmentBreakdown, employmentTypeBreakdown, recentEmployees, payroll } = data;

  return (
    <div className="space-y-8">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time workforce intelligence and department metrics.
          </p>
        </div>
        {isPrivileged && (
          <div className="flex items-center space-x-3">
            <Link
              to="/employees"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Manage Staff
            </Link>
          </div>
        )}
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Workforce
            </span>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{counts.total}</p>
          <p className="text-xs text-slate-500 mt-1">Registered employee profiles</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Employees
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{counts.active}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Currently on duty</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              On Leave / Inactive
            </span>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">
            {counts.onLeave + counts.inactive}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {counts.onLeave} on leave • {counts.inactive} inactive
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Leaves
            </span>
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{counts.pendingLeaves}</p>
          <p className="text-xs text-purple-600 font-medium mt-1">Requires review</p>
        </div>
      </div>

      {/* Payroll Summary Card (Access-Restricted) */}
      {isPrivileged && payroll && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Workforce Compensation Snapshot
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 font-medium border border-indigo-400/20">
              Restricted Access
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800">
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Monthly Payroll</p>
              <p className="text-xl font-extrabold text-white mt-1">
                ${payroll.totalMonthly.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Annual Payroll Budget</p>
              <p className="text-xl font-extrabold text-white mt-1">
                ${payroll.totalAnnual.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Average Base Salary</p>
              <p className="text-xl font-extrabold text-white mt-1">
                ${payroll.averageSalary.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Reporting Staff Count</p>
              <p className="text-xl font-extrabold text-white mt-1">
                {payroll.reportedEmployees} Employees
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Breakdown Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <Building className="w-4 h-4 mr-2 text-indigo-600" />
              By Department
            </h3>
            <Link to="/departments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          {departmentBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No department records yet.</p>
          ) : (
            <div className="space-y-3 mt-3">
              {departmentBreakdown.map((dept, idx) => {
                const percent = counts.total > 0 ? Math.round((dept.count / counts.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>{dept.departmentName}</span>
                      <span className="text-slate-500 font-semibold">{dept.count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Employment Type Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
              Employment Types
            </h3>
          </div>

          {employmentTypeBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No employment data.</p>
          ) : (
            <div className="space-y-3 mt-3">
              {employmentTypeBreakdown.map((item, idx) => {
                const percent = counts.total > 0 ? Math.round((item.count / counts.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>{item.type}</span>
                      <span className="text-slate-500 font-semibold">{item.count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Added Employees */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-600" />
              Recent Additions
            </h3>
            <Link to="/employees" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
              All <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          {recentEmployees.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No employees added yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentEmployees.map((emp) => (
                <div key={emp._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {emp.jobTitle} • {typeof emp.department === 'object' ? emp.department?.name : 'General'}
                    </p>
                  </div>
                  <StatusBadge status={emp.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
