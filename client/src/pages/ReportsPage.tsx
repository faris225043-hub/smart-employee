import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { departmentService } from '../services/departmentService';
import { Department } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Download,
  FileBarChart2,
  Building,
  Users,
  CalendarCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [activeTab, setActiveTab] = useState<'departments' | 'attendance' | 'directory'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptReport, setDeptReport] = useState<any[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [directoryReport, setDirectoryReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    loadActiveReport();
  }, [activeTab, selectedDept, selectedStatus]);

  const loadActiveReport = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'departments') {
        const data = await reportService.getDepartmentReport();
        setDeptReport(data);
      } else if (activeTab === 'attendance') {
        const data = await reportService.getAttendanceSummary();
        setAttendanceReport(data);
      } else if (activeTab === 'directory') {
        const data = await reportService.getDirectory({
          department: selectedDept || undefined,
          status: selectedStatus || undefined,
        });
        setDirectoryReport(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await reportService.exportCsv({
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports &amp; Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate workforce distribution, attendance audits, and exportable CSV reports.
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-60"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {isExporting ? 'Generating CSV...' : 'Export Personnel CSV'}
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('departments')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center ${
              activeTab === 'departments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building className="w-4 h-4 mr-2" />
            Department Allocation
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center ${
              activeTab === 'attendance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Attendance Summary
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center ${
              activeTab === 'directory'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Full Directory Audit
          </button>
        </nav>
      </div>

      {/* Directory Tab Filters */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-center">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Compiling aggregated report metrics..." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Department Report Table */}
          {activeTab === 'departments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Total Staff
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Active
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      On Leave
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Inactive
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptReport.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{dept.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-700 font-semibold">
                        {dept.code}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{dept.totalEmployees}</td>
                      <td className="px-6 py-4 text-emerald-600 font-semibold">
                        {dept.activeEmployees}
                      </td>
                      <td className="px-6 py-4 text-amber-600 font-semibold">
                        {dept.onLeaveEmployees}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">
                        {dept.inactiveEmployees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Summary */}
          {activeTab === 'attendance' && (
            <div className="p-6">
              {attendanceReport.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  No attendance entries aggregated yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {attendanceReport.map((stat, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {stat.status} Records
                      </p>
                      <p className="text-2xl font-black text-slate-900 mt-2">{stat.count}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Total {stat.totalHours || 0} hrs • Avg {stat.avgHours || 0} hrs/day
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Directory Report Table */}
          {activeTab === 'directory' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Employee ID
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Work Email
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Role Title
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    {isPrivileged && (
                      <th scope="col" className="px-6 py-3.5">
                        Salary
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directoryReport.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800">
                        {emp.employeeId}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{emp.email}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                        {typeof emp.department === 'object' ? emp.department?.name : 'General'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{emp.jobTitle}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-800">{emp.status}</span>
                      </td>
                      {isPrivileged && (
                        <td className="px-6 py-4 font-semibold text-emerald-700 text-xs">
                          {emp.salary ? `$${emp.salary.toLocaleString()}` : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
