import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { attendanceService } from '../../services/attendanceService';
import { formatDate, formatTime, getStatusColor, getStatusBgColor } from '../../utils/dateUtils';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceHistory = () => {
  const { user } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      console.log('Fetching history for:', month, year);

      const [historyData, summaryData] = await Promise.all([
        attendanceService.getMyHistory(month, year),
        attendanceService.getMySummary(month, year),
      ]);

      console.log('History data:', historyData);
      console.log('Summary data:', summaryData);
      setHistory(historyData);
      setSummary(summaryData);
    } catch (err) {
      setError('Failed to load attendance history');
      console.error('History error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filter history based on selected filter
  const filteredHistory = selectedFilter === 'all' 
    ? history 
    : history.filter((record) => record.status === selectedFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Attendance History</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Month Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>

          <button
            onClick={handleNextMonth}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Days" value={summary.total} />
            <StatCard label="Present" value={summary.present} color="green" />
            <StatCard label="Absent" value={summary.absent} color="red" />
            <StatCard label="Late" value={summary.late} color="yellow" />
            <StatCard label="Half Day" value={summary.halfDay} color="orange" />
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendar View</h2>
        <CalendarGrid history={history} currentDate={currentDate} registrationDate={user?.createdAt} />
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Records</h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilter('present')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === 'present'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => setSelectedFilter('absent')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === 'absent'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Absent
          </button>
          <button
            onClick={() => setSelectedFilter('late')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === 'late'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Late
          </button>
          <button
            onClick={() => setSelectedFilter('half-day')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedFilter === 'half-day'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Half Day
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check In</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check Out</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Hours</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(record.date)}</td>
                    <td className="py-3 px-4">{record.checkInTime ? formatTime(record.checkInTime) : '-'}</td>
                    <td className="py-3 px-4">
                      {record.checkOutTime ? formatTime(record.checkOutTime) : (
                        record.status === 'absent' ? '-' : (
                          <span className="text-blue-600 font-semibold animate-pulse">Still Working...</span>
                        )
                      )}
                    </td>
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
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No records found for this month
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 text-center`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

const CalendarGrid = ({ history, currentDate, registrationDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getRecordForDate = (day) => {
    if (!day) return null;
    const calendarDate = new Date(year, month, day);
    calendarDate.setHours(0, 0, 0, 0);
    const dateStr = calendarDate.toISOString().split('T')[0];
    
    const record = history.find((r) => {
      const recordDate = new Date(r.date);
      recordDate.setHours(0, 0, 0, 0);
      const recordDateStr = recordDate.toISOString().split('T')[0];
      return recordDateStr === dateStr;
    });
    return record;
  };

  const isBeforeRegistration = (day) => {
    if (!day || !registrationDate) return false;
    const regDate = new Date(registrationDate);
    regDate.setHours(0, 0, 0, 0);
    const currentDay = new Date(year, month, day);
    currentDay.setHours(0, 0, 0, 0);
    return currentDay < regDate;
  };

  const isWeekend = (day) => {
    // Saturday and Sunday are now working days, so return false
    return false;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'absent':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'late':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'half-day':
        return 'bg-orange-100 border-orange-500 text-orange-700';
      default:
        return 'bg-white border-gray-300 text-gray-700';
    }
  };

  const getDotColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      case 'half-day':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const record = getRecordForDate(day);
          const isNonWorkingDay = isWeekend(day);
          const isBeforeReg = isBeforeRegistration(day);
          
          return (
            <div
              key={index}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition cursor-pointer hover:shadow-md ${
                day === null
                  ? 'bg-gray-50 border-gray-200'
                  : isBeforeReg
                  ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
              title={isBeforeReg ? 'Before joining date - No data available' : record ? `${record.status.toUpperCase()} - ${record.checkInTime ? `In: ${new Date(record.checkInTime).toLocaleTimeString()}` : 'No check-in'}` : 'No record'}
            >
              <div className="text-lg font-bold">{day}</div>
              {record && (
                <div className="flex gap-1 mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${getDotColor(record.status)}`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Present</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Absent</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
          <span className="text-sm text-gray-700">Late</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-100 border-2 border-orange-500 rounded"></div>
          <span className="text-sm text-gray-700">Half Day</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
