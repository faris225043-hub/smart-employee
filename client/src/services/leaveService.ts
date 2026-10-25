import api from './api';
import { LeaveRequest, Pagination } from '../types';

export const leaveService = {
  getLeaves: async (params?: any): Promise<{ data: LeaveRequest[]; pagination: Pagination }> => {
    const res = await api.get('/leaves', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  submitLeave: async (data: any): Promise<LeaveRequest> => {
    const res = await api.post('/leaves', data);
    return res.data.data;
  },

  reviewLeave: async (id: string, data: { status: 'Approved' | 'Rejected'; reviewNotes?: string }): Promise<LeaveRequest> => {
    const res = await api.patch(`/leaves/${id}/review`, data);
    return res.data.data;
  },
};
