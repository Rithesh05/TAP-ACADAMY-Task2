import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { formatDate, formatTime, getStatusColor, getStatusBgColor } from '../../utils/dateUtils';
import { Filter, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const AllEmployeesAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    employeeId: '',
    department: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const data = await attendanceService.getAllAttendance({ limit: 1000 });
      const uniqueDepts = [...new Set(data.attendance.map((record) => record.userId.department))].sort();
      setDepartments(uniqueDepts);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAllAttendance(filters);
      setAttendance(data.attendance);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Employees Attendance</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="Search by Employee ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  status: '',
                  employeeId: '',
                  department: '',
                  page: 1,
                  limit: 20,
                })
              }
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Employee ID</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Department</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check In</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check Out</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">{record.userId.name}</p>
                        <p className="text-sm text-gray-600">{record.userId.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{record.userId.employeeId}</td>
                    <td className="py-3 px-4">{record.userId.department}</td>
                    <td className="py-3 px-4">{formatDate(record.date)}</td>
                    <td className="py-3 px-4">{record.checkInTime ? formatTime(record.checkInTime) : '-'}</td>
                    <td className="py-3 px-4">{record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: getStatusBgColor(record.status),
                          color: getStatusColor(record.status),
                        }}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{record.totalHours?.toFixed(2) || 0}h</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total records)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-lg transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEmployeesAttendance;
