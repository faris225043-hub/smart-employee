import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEmployee(id);
    }
  }, [id]);

  const loadEmployee = async (empId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployeeById(empId);
      setEmployee(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving employee profile..." fullPage />;
  }

  if (error || !employee) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-rose-800">Profile Not Found</h3>
        <p className="mt-1 text-sm text-rose-600">{error || 'Unable to locate employee profile.'}</p>
        <Link
          to="/employees"
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  const dept = typeof employee.department === 'object' ? employee.department : null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/employees')}
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Employee Directory
      </button>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 p-6 flex items-end">
          <span className="text-xs font-mono font-bold tracking-wider text-indigo-100 bg-black/20 px-2.5 py-1 rounded-md">
            {employee.employeeId}
          </span>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar and basic info */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-6 gap-4">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
                <div className="w-full h-full rounded-xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
                  {employee.firstName.charAt(0)}
                  {employee.lastName.charAt(0)}
                </div>
              </div>
              <div className="pt-2">
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  {employee.firstName} {employee.lastName}
                </h1>
                <p className="text-sm font-medium text-slate-500">{employee.jobTitle}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <StatusBadge status={employee.status} />
              <StatusBadge status={employee.employmentType} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${employee.email}`} className="hover:text-indigo-600 transition">
                    {employee.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{employee.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Department & Placement */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Organizational Placement
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{dept ? `${dept.name} (${dept.code})` : 'Unassigned'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Manager:{' '}
                    {employee.manager
                      ? `${employee.manager.firstName} ${employee.manager.lastName}`
                      : 'None (Direct Report)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Employment Specifics */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Employment Terms
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Joined:{' '}
                    {employee.joiningDate
                      ? new Date(employee.joiningDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                {isPrivileged && (
                  <div className="flex items-center space-x-3 text-sm text-slate-700 font-semibold">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Compensation:{' '}
                      {employee.salary !== null && employee.salary !== undefined
                        ? `$${employee.salary.toLocaleString()} / yr`
                        : 'Not specified'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
