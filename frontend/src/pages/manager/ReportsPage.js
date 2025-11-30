import React, { useState } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { formatDate, formatTime, getStatusColor, getStatusBgColor } from '../../utils/dateUtils';
import { Download, Loader, Filter } from 'lucide-react';

const ReportsPage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await attendanceService.getAllAttendance({
        startDate: filters.startDate,
        endDate: filters.endDate,
        employeeId: filters.employeeId,
        page: 1,
        limit: 1000,
      });
      setAttendance(data.attendance);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await attendanceService.exportAttendance(
        filters.startDate,
        filters.endDate,
        filters.employeeId
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export report');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const calculateSummary = () => {
    return {
      total: attendance.length,
      present: attendance.filter((r) => r.status === 'present').length,
      absent: attendance.filter((r) => r.status === 'absent').length,
      late: attendance.filter((r) => r.status === 'late').length,
      halfDay: attendance.filter((r) => r.status === 'half-day').length,
      totalHours: attendance.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    };
  };

  const summary = calculateSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Attendance Reports</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filter Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Generate Report</h2>
        </div>

        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID (Optional)</label>
              <input
                type="text"
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                placeholder="Leave empty for all"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Report</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Export Button */}
      {attendance.length > 0 && (
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {exporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Summary */}
      {attendance.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <SummaryCard label="Total Records" value={summary.total} color="blue" />
            <SummaryCard label="Present" value={summary.present} color="green" />
            <SummaryCard label="Absent" value={summary.absent} color="red" />
            <SummaryCard label="Late" value={summary.late} color="yellow" />
            <SummaryCard label="Half Day" value={summary.halfDay} color="orange" />
            <SummaryCard label="Total Hours" value={summary.totalHours.toFixed(1)} color="purple" />
          </div>
        </div>
      )}

      {/* Table */}
      {attendance.length > 0 && (
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
                {attendance.map((record) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {attendance.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No data to display. Generate a report to see results.</p>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 text-center`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default ReportsPage;
