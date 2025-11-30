import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { attendanceService } from '../../services/attendanceService';
import { formatTime, formatDate, getStatusColor, getStatusBgColor } from '../../utils/dateUtils';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Loader } from 'lucide-react';

const EmployeeDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getEmployeeDashboard();
      console.log('Dashboard data:', data);
      setDashboard(data);
      setTodayStatus(data.todayStatus);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const response = await attendanceService.checkIn();
      setTodayStatus(response.attendance);
      // Refresh dashboard to update month summary
      await fetchDashboard();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      const response = await attendanceService.checkOut();
      setTodayStatus(response.attendance);
      // Refresh dashboard to update month summary
      await fetchDashboard();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const monthSummary = dashboard?.monthSummary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Quick Check In/Out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Status</h2>
          {todayStatus?.checkInTime ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check In:</span>
                <span className="font-semibold text-green-600">{formatTime(todayStatus.checkInTime)}</span>
              </div>
              {todayStatus.checkOutTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Check Out:</span>
                  <span className="font-semibold text-blue-600">{formatTime(todayStatus.checkOutTime)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: getStatusBgColor(todayStatus.status),
                    color: getStatusColor(todayStatus.status),
                  }}
                >
                  {todayStatus.status.toUpperCase()}
                </span>
              </div>
              {todayStatus.checkOutTime ? (
                <button
                  disabled
                  className="w-full mt-4 bg-gray-400 text-white py-2 rounded-lg font-semibold cursor-not-allowed"
                >
                  Already Checked Out
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
                >
                  {checkingOut ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Checking Out...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Check Out</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">No check-in recorded for today</p>
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
              >
                {checkingIn ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Checking In...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Check In</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              to="/employee/mark-attendance"
              className="block p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-semibold transition"
            >
              Mark Attendance
            </Link>
            <Link
              to="/employee/history"
              className="block p-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-semibold transition"
            >
              View Attendance History
            </Link>
            <Link
              to="/employee/profile"
              className="block p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg font-semibold transition"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Month Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">This Month's Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SummaryCard icon={<CheckCircle />} label="Present" value={monthSummary.present || 0} color="green" />
          <SummaryCard icon={<AlertCircle />} label="Absent" value={monthSummary.absent || 0} color="red" />
          <SummaryCard icon={<Clock />} label="Late" value={monthSummary.late || 0} color="yellow" />
          <SummaryCard icon={<TrendingUp />} label="Half Day" value={monthSummary.halfDay || 0} color="orange" />
          <SummaryCard label="Total Hours" value={monthSummary.totalHours?.toFixed(1) || 0} color="blue" />
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Attendance (Last 7 Days)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-gray-700 font-semibold">Date</th>
                <th className="text-left py-2 px-4 text-gray-700 font-semibold">Check In</th>
                <th className="text-left py-2 px-4 text-gray-700 font-semibold">Check Out</th>
                <th className="text-left py-2 px-4 text-gray-700 font-semibold">Status</th>
                <th className="text-left py-2 px-4 text-gray-700 font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentAttendance?.map((record) => (
                <tr key={record._id} className="border-b hover:bg-gray-50">
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
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 text-center`}>
      {icon && <div className="flex justify-center mb-2">{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>}
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default EmployeeDashboard;
