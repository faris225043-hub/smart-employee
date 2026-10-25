import api from './api';
import { DashboardSummary } from '../types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await api.get('/dashboard/summary');
    return res.data.data;
  },
};
