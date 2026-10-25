import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import { employeeService } from '../services/employeeService';
import { LeaveRequest, Employee, Pagination as PaginationType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import {
  CalendarRange,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LeavesPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 15,
    totalRecords: 0,
    totalPages: 0,
  });

  // Request Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitSubmitting, setSubmitSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitForm, setSubmitForm] = useState({
    employee: '',
    leaveType: 'Annual',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    reason: '',
  });

  // Review Modal State
  const [leaveToReview, setLeaveToReview] = useState<LeaveRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (isPrivileged) {
      employeeService.getEmployees({ limit: 100, status: 'Active' })
        .then((res) => setEmployees(res.data))
        .catch(() => {});
    }
  }, [isPrivileged]);

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus, currentPage]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await leaveService.getLeaves({
        page: currentPage,
        limit: 15,
        status: filterStatus || undefined,
      });
      setLeaves(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = () => {
    setSubmitForm({
      employee: isPrivileged && employees.length > 0 ? employees[0]._id : (user?.employee || ''),
      leaveType: 'Annual',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      reason: '',
    });
    setSubmitError(null);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.reason || submitForm.reason.trim().length < 5) {
      setSubmitError('Please provide a reason of at least 5 characters.');
      return;
    }

    try {
      setSubmitSubmitting(true);
      setSubmitError(null);
      await leaveService.submitLeave(submitForm);
      setIsSubmitModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitSubmitting(false);
    }
  };

  const handleOpenReview = (leave: LeaveRequest, action: 'Approved' | 'Rejected') => {
    setLeaveToReview(leave);
    setReviewStatus(action);
    setReviewNotes('');
    setReviewError(null);
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveToReview) return;

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      await leaveService.reviewLeave(leaveToReview._id, {
        status: reviewStatus,
        reviewNotes,
      });
      setLeaveToReview(null);
      fetchLeaves();
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Review failed.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Time Off &amp; Leaves</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit leave requests, view approval status, and manage team PTO.
          </p>
        </div>

        <button
          onClick={handleOpenSubmit}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Request Leave
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center space-x-4">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Leave Statuses</option>
          <option value="Pending">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {filterStatus && (
          <button
            onClick={() => {
              setFilterStatus('');
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Clear Filter
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
          <LoadingSpinner text="Fetching leave applications..." />
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarRange className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No leave requests found</h3>
            <p className="text-sm text-slate-500 mt-1">Submit a leave request using the button above.</p>
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
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Days
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    {isPrivileged && (
                      <th scope="col" className="px-6 py-3.5 text-right">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">
                            {item.employee
                              ? `${item.employee.firstName} ${item.employee.lastName}`
                              : 'N/A'}
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            ({item.employee?.employeeId})
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800">{item.leaveType}</td>

                      <td className="px-6 py-4 text-xs font-mono text-slate-600">
                        {new Date(item.startDate).toISOString().slice(0, 10)} to{' '}
                        {new Date(item.endDate).toISOString().slice(0, 10)}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">{item.daysCount}</td>

                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={item.reason}>
                        {item.reason}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      {isPrivileged && (
                        <td className="px-6 py-4 text-right">
                          {item.status === 'Pending' ? (
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => handleOpenReview(item, 'Approved')}
                                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md transition"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(item, 'Rejected')}
                                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Reviewed by {item.reviewedBy?.name || 'Manager'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(p: number) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* Submit Leave Modal */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Leave Request">
        {submitError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmitLeave} className="space-y-4">
          {isPrivileged && employees.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Employee *
              </label>
              <select
                required
                value={submitForm.employee}
                onChange={(e) => setSubmitForm({ ...submitForm, employee: e.target.value })}
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
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Leave Type *
            </label>
            <select
              value={submitForm.leaveType}
              onChange={(e) => setSubmitForm({ ...submitForm, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Annual">Annual Paid Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={submitForm.startDate}
                onChange={(e) => setSubmitForm({ ...submitForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={submitForm.endDate}
                onChange={(e) => setSubmitForm({ ...submitForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Reason for Absence *
            </label>
            <textarea
              required
              rows={3}
              value={submitForm.reason}
              onChange={(e) => setSubmitForm({ ...submitForm, reason: e.target.value })}
              placeholder="Provide context for your manager or HR team..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={submitSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-60"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Leave Modal */}
      <Modal
        isOpen={!!leaveToReview}
        onClose={() => setLeaveToReview(null)}
        title={`${reviewStatus} Leave Request`}
      >
        {reviewError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {reviewError}
          </div>
        )}

        <form onSubmit={handleConfirmReview} className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            You are about to mark this request as{' '}
            <span
              className={`font-bold ${
                reviewStatus === 'Approved' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {reviewStatus}
            </span>{' '}
            for{' '}
            <span className="font-semibold text-slate-900">
              {leaveToReview?.employee?.firstName} {leaveToReview?.employee?.lastName}
            </span>{' '}
            ({leaveToReview?.daysCount} days, {leaveToReview?.leaveType}).
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Review Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Approved per annual leave entitlement."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLeaveToReview(null)}
              disabled={reviewSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className={`px-4 py-2 text-white rounded-lg text-sm font-semibold shadow-sm transition ${
                reviewStatus === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm {reviewStatus}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
