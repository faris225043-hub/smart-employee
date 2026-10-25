import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';
import { AttendanceRecord, Employee, Pagination as PaginationType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import {
  CalendarCheck,
  Plus,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AttendancePage: React.FC = () => {
  const { hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 15,
    totalRecords: 0,
    totalPages: 0,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
    checkInTime: '09:00',
    checkOutTime: '17:30',
    remarks: '',
  });

  useEffect(() => {
    if (isPrivileged) {
      employeeService.getEmployees({ limit: 100, status: 'Active' })
        .then((res) => setEmployees(res.data))
        .catch(() => {});
    }
  }, [isPrivileged]);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate, filterStatus, currentPage]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await attendanceService.getAttendance({
        page: currentPage,
        limit: 15,
        date: filterDate || undefined,
        status: filterStatus || undefined,
      });
      setRecords(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      employee: employees.length > 0 ? employees[0]._id : '',
      date: new Date().toISOString().slice(0, 10),
      status: 'Present',
      checkInTime: '09:00',
      checkOutTime: '17:30',
      remarks: '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee || !formData.date || !formData.status) {
      setModalError('Please select employee, date, and status.');
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);
      await attendanceService.recordAttendance({
        ...formData,
        checkInTime: formData.status === 'Absent' ? null : formData.checkInTime || null,
        checkOutTime: formData.status === 'Absent' ? null : formData.checkOutTime || null,
      });
      setIsModalOpen(false);
      fetchAttendance();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to record attendance. Duplicate date?');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily employee shifts, timestamps, and total working hours.
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Attendance
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {(filterDate || filterStatus) && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterStatus('');
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Reset Filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving attendance log..." />
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No attendance entries recorded</h3>
            <p className="text-sm text-slate-500 mt-1">
              Select another date or log attendance for the workforce.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Check-In
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Check-Out
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">
                            {rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : 'N/A'}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            ({rec.employee?.employeeId})
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {new Date(rec.date).toISOString().slice(0, 10)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={rec.status} />
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {rec.checkInTime || '—'}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {rec.checkOutTime || '—'}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {rec.workHours ? `${rec.workHours} hrs` : '—'}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {rec.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(p: number) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* Record Attendance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Daily Attendance">
        {modalError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Employee *
            </label>
            <select
              required
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Attendance Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {formData.status !== 'Absent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Check-In Time
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Check-Out Time
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Remarks
            </label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Completed scheduled shift on time"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={modalSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalSubmitting}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-60"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
