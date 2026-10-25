import api from './api';
import { AttendanceRecord, Pagination } from '../types';

export const attendanceService = {
  getAttendance: async (params?: any): Promise<{ data: AttendanceRecord[]; pagination: Pagination }> => {
    const res = await api.get('/attendance', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  recordAttendance: async (data: any): Promise<AttendanceRecord> => {
    const res = await api.post('/attendance', data);
    return res.data.data;
  },

  updateAttendance: async (id: string, data: any): Promise<AttendanceRecord> => {
    const res = await api.put(`/attendance/${id}`, data);
    return res.data.data;
  },
};
