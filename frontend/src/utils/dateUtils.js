import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatTime = (date) => {
  return format(new Date(date), 'HH:mm:ss');
};

export const formatDateTime = (date) => {
  return format(new Date(date), 'dd MMM yyyy HH:mm:ss');
};

export const getMonthDays = (month, year) => {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
};

export const getStatusColor = (status) => {
  const colors = {
    present: '#10b981',
    absent: '#ef4444',
    late: '#f59e0b',
    'half-day': '#f97316',
  };
  return colors[status] || '#6b7280';
};

export const getStatusBgColor = (status) => {
  const colors = {
    present: '#d1fae5',
    absent: '#fee2e2',
    late: '#fef3c7',
    'half-day': '#fed7aa',
  };
  return colors[status] || '#f3f4f6';
};
