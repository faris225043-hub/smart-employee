import api from './api';

export const reportService = {
  getDirectory: async (params?: any) => {
    const res = await api.get('/reports/directory', { params });
    return res.data.data;
  },

  getDepartmentReport: async () => {
    const res = await api.get('/reports/departments');
    return res.data.data;
  },

  getAttendanceSummary: async (params?: any) => {
    const res = await api.get('/reports/attendance-summary', { params });
    return res.data.data;
  },

  exportCsv: async (params?: any) => {
    const res = await api.get('/reports/export-csv', {
      params,
      responseType: 'blob',
    });
    // Trigger browser file download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  },
};
