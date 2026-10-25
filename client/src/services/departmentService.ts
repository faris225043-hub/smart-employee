import api from './api';
import { Department } from '../types';

export const departmentService = {
  getDepartments: async (params?: { search?: string; isActive?: boolean }): Promise<Department[]> => {
    const res = await api.get('/departments', { params });
    return res.data.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const res = await api.get(`/departments/${id}`);
    return res.data.data;
  },

  createDepartment: async (data: Partial<Department>): Promise<Department> => {
    const res = await api.post('/departments', data);
    return res.data.data;
  },

  updateDepartment: async (id: string, data: Partial<Department>): Promise<Department> => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data.data;
  },

  deleteDepartment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};
