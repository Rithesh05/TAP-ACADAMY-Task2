import api from './api';

export const attendanceService = {
  // Employee
  checkIn: async () => {
    const response = await api.post('/attendance/checkin');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getMyHistory: async (month, year) => {
    const response = await api.get('/attendance/my-history', {
      params: { month, year },
    });
    return response.data;
  },

  getMySummary: async (month, year) => {
    const response = await api.get('/attendance/my-summary', {
      params: { month, year },
    });
    return response.data;
  },

  // Manager
  getAllAttendance: async (params) => {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  },

  getEmployeeAttendance: async (employeeId, month, year) => {
    const response = await api.get(`/attendance/employee/${employeeId}`, {
      params: { month, year },
    });
    return response.data;
  },

  getSummary: async (startDate, endDate) => {
    const response = await api.get('/attendance/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTodayStatusAll: async () => {
    const response = await api.get('/attendance/today-status');
    return response.data;
  },

  exportAttendance: async (startDate, endDate, employeeId) => {
    const response = await api.get('/attendance/export', {
      params: { startDate, endDate, employeeId },
      responseType: 'blob',
    });
    return response.data;
  },

  getMemberAttendanceHistory: async (memberId) => {
    const response = await api.get(`/attendance/member/${memberId}`);
    return response.data;
  },
};
