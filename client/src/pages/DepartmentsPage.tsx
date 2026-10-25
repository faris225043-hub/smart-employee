import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/departmentService';
import { Department } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Building2,
  Plus,
  Users,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DepartmentsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getDepartments({ search: search || undefined });
      setDepartments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDeptToEdit(null);
    setFormData({ name: '', code: '', description: '', isActive: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setDeptToEdit(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      isActive: dept.isActive,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setFormError('Department name and code are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      if (deptToEdit) {
        await departmentService.updateDepartment(deptToEdit._id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }

      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Operation failed. Duplicate name or code.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deptToDelete) return;
    try {
      setIsDeleting(true);
      await departmentService.deleteDepartment(deptToDelete._id);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete department.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize functional business divisions and view staff allocations.
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Department
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No departments found</h3>
          <p className="text-sm text-slate-500 mt-1">Get started by creating your first department.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{dept.name}</h3>
                      <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  {isPrivileged && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Department"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeptToDelete(dept)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-slate-800">{dept.employeeCount || 0}</span>
                  <span>Employees</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dept.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {dept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={deptToEdit ? `Edit Department (${deptToEdit.code})` : 'Create Department'}
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Engineering"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Department Code *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. ENG"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of department scope..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Department is actively operating
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={formSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-60"
            >
              {formSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {deptToEdit ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deptToDelete}
        onClose={() => setDeptToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Department"
        message={
          deptToDelete?.employeeCount && deptToDelete.employeeCount > 0
            ? `Cannot delete "${deptToDelete?.name}" because ${deptToDelete.employeeCount} employee(s) are assigned to it. You must reassign those employees first.`
            : `Are you sure you want to delete the department "${deptToDelete?.name}" (${deptToDelete?.code})? This action cannot be undone.`
        }
        confirmText="Delete Department"
        isDestructive={true}
      />
    </div>
  );
};
