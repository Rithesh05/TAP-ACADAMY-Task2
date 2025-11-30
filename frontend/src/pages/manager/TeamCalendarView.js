import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { formatDate, getStatusColor, getStatusBgColor } from '../../utils/dateUtils';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';

const TeamCalendarView = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayRecords, setSelectedDayRecords] = useState([]);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // const month = currentDate.getMonth() + 1;
      // const year = currentDate.getFullYear();
      const data = await attendanceService.getAllAttendance({
        page: 1,
        limit: 1000,
      });
      setAttendance(data.attendance);
    } catch (err) {
      setError('Failed to load attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const records = attendance.filter((r) => r.date.split('T')[0] === dateStr);
    setSelectedDayRecords(records);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

  const getRecordsForDate = (day) => {
    if (!day) return [];
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return attendance.filter((r) => r.date.split('T')[0] === dateStr);
  };

  const getStatusStats = (records) => {
    return {
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      halfDay: records.filter((r) => r.status === 'half-day').length,
    };
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Team Calendar View</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {/* Month Navigation */}
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

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const records = getRecordsForDate(day);
              const stats = getStatusStats(records);
              const isSelected = selectedDate && selectedDate.getDate() === day;

              return (
                <div
                  key={index}
                  onClick={() => day && handleDateClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition ${
                    day === null
                      ? 'bg-gray-50 border-gray-200'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 bg-white'
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-semibold text-gray-800">{day}</div>
                      {records.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {stats.present > 0 && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                          {stats.absent > 0 && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                          {stats.late > 0 && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>}
                          {stats.halfDay > 0 && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Late</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Half Day</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedDate ? formatDate(selectedDate) : 'Select a date'}
          </h2>

          {selectedDate && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <StatBox label="Present" value={getStatusStats(selectedDayRecords).present} color="green" />
                <StatBox label="Absent" value={getStatusStats(selectedDayRecords).absent} color="red" />
                <StatBox label="Late" value={getStatusStats(selectedDayRecords).late} color="yellow" />
                <StatBox label="Half Day" value={getStatusStats(selectedDayRecords).halfDay} color="orange" />
              </div>

              {/* Records List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedDayRecords.length > 0 ? (
                  selectedDayRecords.map((record) => (
                    <div
                      key={record._id}
                      className="bg-gray-50 p-3 rounded-lg border-l-4"
                      style={{ borderLeftColor: getStatusColor(record.status) }}
                    >
                      <p className="font-semibold text-gray-800">{record.userId.name}</p>
                      <p className="text-xs text-gray-600">{record.userId.employeeId}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: getStatusBgColor(record.status),
                            color: getStatusColor(record.status),
                          }}
                        >
                          {record.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">{record.totalHours?.toFixed(1)}h</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No records for this date</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded p-2 text-center`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
};

export default TeamCalendarView;
