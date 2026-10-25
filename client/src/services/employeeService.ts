import api from './api';
import { Employee, Pagination } from '../types';

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  employmentType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const employeeService = {
  getEmployees: async (params?: GetEmployeesParams): Promise<{ data: Employee[]; pagination: Pagination }> => {
    const res = await api.get('/employees', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const res = await api.get(`/employees/${id}`);
    return res.data.data;
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const res = await api.post('/employees', data);
    return res.data.data;
  },

  updateEmployee: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data.data;
  },

  deleteEmployee: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },
};
