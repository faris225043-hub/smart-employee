import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import { Employee, Department, Pagination as PaginationType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge } from '../components/common/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmployeeModal } from '../components/employees/EmployeeModal';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Building,
  Briefcase,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmployeesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isPrivileged = hasRole(['Admin', 'HR Manager']);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedStatus, selectedType, currentPage]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getEmployees({
        page: currentPage,
        limit: 10,
        search,
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
        employmentType: selectedType || undefined,
      });
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      await employeeService.deleteEmployee(employeeToDelete._id);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, and maintain organizational personnel records.
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, name, email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading personnel records..." />
        ) : employees.length === 0 ? (
          <div className="py-16 text-center">
            <Filter className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching employees found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or clear the filters to view all records.
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
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => {
                    const deptName =
                      typeof emp.department === 'object' ? emp.department?.name : 'General';
                    return (
                      <tr key={emp._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {emp.firstName.charAt(0)}
                              {emp.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">{emp.email}</p>
                              <p className="text-xs text-slate-400 sm:hidden mt-0.5">{emp.jobTitle}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono font-medium text-xs text-slate-800">
                          {emp.employeeId}
                        </td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{deptName}</p>
                            <p className="text-[11px] text-slate-400">{emp.jobTitle}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={emp.employmentType} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={emp.status} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center space-x-2">
                            <Link
                              to={`/employees/${emp._id}`}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {isPrivileged && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(emp)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Edit Employee"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEmployeeToDelete(emp)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete Employee"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(p: number) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEmployees}
        employeeToEdit={employeeToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Employee"
        message={`Are you sure you want to permanently remove employee "${employeeToDelete?.firstName} ${employeeToDelete?.lastName}" (${employeeToDelete?.employeeId})? This will also remove linked attendance and leave history.`}
        confirmText="Delete Record"
        isDestructive={true}
      />
    </div>
  );
};
