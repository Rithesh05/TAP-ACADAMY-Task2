import api from './api';

export const dashboardService = {
  getEmployeeDashboard: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },

  getManagerDashboard: async () => {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },

  getManagerDepartmentDetails: async () => {
    const response = await api.get('/dashboard/manager/department');
    return response.data;
  },
};
