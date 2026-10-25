import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Employee, Department } from '../../types';
import { departmentService } from '../../services/departmentService';
import { employeeService } from '../../services/employeeService';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: Employee | null;
}

export const EmployeeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeToEdit,
}) => {
  const { hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    jobTitle: '',
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    salary: '',
    manager: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (employeeToEdit) {
        setFormData({
          firstName: employeeToEdit.firstName || '',
          lastName: employeeToEdit.lastName || '',
          email: employeeToEdit.email || '',
          phone: employeeToEdit.phone || '',
          department:
            typeof employeeToEdit.department === 'object'
              ? employeeToEdit.department?._id || ''
              : employeeToEdit.department || '',
          jobTitle: employeeToEdit.jobTitle || '',
          employmentType: employeeToEdit.employmentType || 'Full-time',
          joiningDate: employeeToEdit.joiningDate
            ? new Date(employeeToEdit.joiningDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          status: employeeToEdit.status || 'Active',
          salary: employeeToEdit.salary !== null && employeeToEdit.salary !== undefined ? String(employeeToEdit.salary) : '',
          manager: employeeToEdit.manager?._id || '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: '',
          jobTitle: '',
          employmentType: 'Full-time',
          joiningDate: new Date().toISOString().slice(0, 10),
          status: 'Active',
          salary: '',
          manager: '',
        });
      }
      setError(null);
    }
  }, [isOpen, employeeToEdit]);

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const [depts, empsRes] = await Promise.all([
        departmentService.getDepartments({ isActive: true }),
        employeeService.getEmployees({ limit: 100 }),
      ]);
      setDepartments(depts);
      setManagers(empsRes.data);
    } catch (err: any) {
      setError('Failed to load departments or managers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.jobTitle) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        ...formData,
        salary: formData.salary ? Number(formData.salary) : null,
        manager: formData.manager || null,
      };

      if (employeeToEdit) {
        await employeeService.updateEmployee(employeeToEdit._id, payload);
      } else {
        await employeeService.createEmployee(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed. Please verify input.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? `Edit Employee (${employeeToEdit.employeeId})` : 'Add New Employee'}
      maxWidth="2xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select a department...</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Joining Date
              </label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isPrivileged && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Annual Salary ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g. 85000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reporting Manager
              </label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">None (Top-level or Unassigned)</option>
                {managers
                  .filter((m) => !employeeToEdit || m._id !== employeeToEdit._id)
                  .map((mgr) => (
                    <option key={mgr._id} value={mgr._id}>
                      {mgr.firstName} {mgr.lastName} ({mgr.employeeId})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {employeeToEdit ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
